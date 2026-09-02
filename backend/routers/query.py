"""
Query router — exposes two endpoints:

  POST /api/query          — synchronous, returns the full response JSON.
  POST /api/query/stream   — Server-Sent Events stream; emits progress events
                             while the LangGraph agent runs, then a final
                             'complete' event with the full payload.

Both endpoints share the same core logic (_run_agent) which executes the
LangGraph SQL agent synchronously.  The streaming endpoint runs that logic
in a thread-pool worker so the async event loop is never blocked, and relays
each LangGraph step as an SSE frame via an asyncio.Queue.
"""

import asyncio
import json
import logging
import time
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from agent import get_agent
from config import DATABASE_URL, LLM_MODEL, SQL_DIALECT
from db import build_engine, run_sql
from models import QueryRequest
from utils import extract_tables, to_text

logger = logging.getLogger(__name__)
router = APIRouter()

# LangChain tool name → human-readable timeline step label
_TOOL_STEPS: dict[str, str] = {
    "sql_db_list_tables": "Fetching Tables",
    "sql_db_schema": "Reading Table Schema",
    "sql_db_query": "Generating SQL",
    "sql_db_query_checker": "Validating SQL",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _sse(data: dict) -> str:
    """Format a dict as a single SSE frame."""
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def _build_timeline(tl_events: list[tuple[str, int]]) -> list[dict]:
    """Deduplicate and format timeline events."""
    seen: set[str] = set()
    timeline: list[dict] = []
    for step, ms in tl_events:
        if step not in seen:
            timeline.append({"step": step, "status": "done", "time": f"{ms}ms"})
            seen.add(step)
    return timeline


def _build_payload(
    answer: str,
    sql_query: str | None,
    tl_events: list[tuple[str, int]],
    token_usage: dict,
    total_ms: int,
    columns: list[str],
    rows: list[list[str]],
) -> dict:
    return {
        "content": answer,
        "sql": sql_query or "",
        "result": {"columns": columns, "rows": rows},
        "timeline": _build_timeline(tl_events),
        "stats": {
            "executionTime": f"{total_ms}ms",
            "rowsReturned": len(rows),
            "columnsReturned": len(columns),
            "database": f"defaultdb ({SQL_DIALECT.upper()})",
            "llm": LLM_MODEL,
        },
        "tokenUsage": token_usage,
        "tablesUsed": extract_tables(sql_query) if sql_query else [],
    }


# ---------------------------------------------------------------------------
# Core agent runner — synchronous, designed to run in a thread.
# ---------------------------------------------------------------------------

def _run_agent(
    question: str,
    on_event=None,          # optional callback(tag, payload) for streaming
) -> tuple[str, str | None, list[tuple[str, int]], dict, int]:
    """
    Stream the LangGraph agent for `question`.

    Emits granular step events via on_event so the caller can relay them
    as SSE frames in real time.  Event shapes:

      {"type": "init",             "step": str, "message": str}
      {"type": "status",           "step": str, "message": str}
      {"type": "tables_found",     "step": str, "tables": [...], "message": str}
      {"type": "schema_retrieved", "step": str, "preview": str, "message": str}
      {"type": "sql_generated",    "step": str, "sql": str,     "message": str}
      {"type": "sql_validated",    "step": str, "message": str}
      {"type": "answer",           "step": str, "content": str, "message": str}

    Returns (answer, sql_query, tl_events, token_usage, total_ms).
    """
    logger.info("Agent run started | question=%r", question)
    agent = get_agent()
    start = time.time()

    sql_query: str | None = None
    answer = ""
    token_usage: dict = {"prompt": 0, "completion": 0, "total": 0}
    tl_events: list[tuple[str, int]] = []

    # ---- Phase 1: Initialisation (before agent loop) ----
    if on_event:
        on_event("step", {
            "type": "init",
            "step": "Initializing Agent",
            "message": f"Loading {LLM_MODEL} and SQL tools...",
        })
    tl_events.append(("Initializing Agent", 0))

    if on_event:
        on_event("step", {
            "type": "init",
            "step": "Connecting to Database",
            "message": f"Establishing {SQL_DIALECT.upper()} connection...",
        })
    tl_events.append(("Connecting to Database", 0))

    # ---- Phase 2: Agent execution loop ----
    for event in agent.stream(
        {"messages": [("user", question)]},
        stream_mode="values",
    ):
        msg = event["messages"][-1]
        elapsed = int((time.time() - start) * 1000)
        kind = type(msg).__name__

        if kind == "AIMessage":
            tool_calls = getattr(msg, "tool_calls", None) or []

            if tool_calls:
                for tc in tool_calls:
                    tool_name: str = tc.get("name", "")
                    step_label = _TOOL_STEPS.get(tool_name, tool_name)
                    tl_events.append((step_label, elapsed))
                    logger.info(
                        "[%5dms] tool_call=%s args=%s", elapsed, tool_name, tc.get("args", {})
                    )

                    if tool_name == "sql_db_list_tables":
                        if on_event:
                            on_event("step", {
                                "type": "status",
                                "step": "Fetching Tables",
                                "message": "Discovering available database tables...",
                            })

                    elif tool_name == "sql_db_schema":
                        if on_event:
                            on_event("step", {
                                "type": "status",
                                "step": "Reading Table Schema",
                                "message": "Analyzing schema for relevant tables...",
                            })

                    elif tool_name == "sql_db_query_checker":
                        if on_event:
                            on_event("step", {
                                "type": "status",
                                "step": "Validating SQL",
                                "message": "Checking SQL syntax and safety...",
                            })

                    elif tool_name == "sql_db_query":
                        candidate = tc.get("args", {}).get("query")
                        if candidate:
                            sql_query = candidate
                            logger.info("[%5dms] SQL generated: %s", elapsed, sql_query)
                        if on_event:
                            on_event("step", {
                                "type": "sql_generated",
                                "step": "Generating SQL",
                                "sql": sql_query or "",
                                "message": "SQL query constructed",
                            })

            else:
                # Final answer — no tool calls means the agent is done
                answer = to_text(msg.content)
                tl_events.append(("Generating Final Response", elapsed))
                logger.info("[%5dms] Final answer: %s", elapsed, answer)

                if on_event:
                    on_event("step", {
                        "type": "answer",
                        "step": "Generating Final Response",
                        "content": answer,
                        "message": "Composing natural language response...",
                    })

                um = getattr(msg, "usage_metadata", None) or {}
                if um:
                    token_usage = {
                        "prompt": um.get("input_tokens", 0),
                        "completion": um.get("output_tokens", 0),
                        "total": um.get("total_tokens", 0),
                    }
                    logger.info("Token usage: %s", token_usage)

        elif kind == "ToolMessage":
            msg_name = getattr(msg, "name", "")
            content = to_text(msg.content) if hasattr(msg, "content") else ""

            logger.info("[%5dms] tool_result=%s content=%r", elapsed, msg_name, content[:200])

            if msg_name == "sql_db_list_tables":
                tables = [t.strip() for t in content.split(",") if t.strip()]
                tl_events.append(("Tables Found", elapsed))
                logger.info("[%5dms] Tables found: %s", elapsed, tables)
                if on_event:
                    on_event("step", {
                        "type": "tables_found",
                        "step": "Tables Found",
                        "tables": tables,
                        "message": f"Discovered {len(tables)} table{'s' if len(tables) != 1 else ''}",
                    })

            elif msg_name == "sql_db_schema":
                preview = content[:500] if len(content) > 500 else content
                tl_events.append(("Schema Retrieved", elapsed))
                if on_event:
                    on_event("step", {
                        "type": "schema_retrieved",
                        "step": "Schema Retrieved",
                        "preview": preview,
                        "message": "Table schema loaded successfully",
                    })

            elif msg_name == "sql_db_query_checker":
                tl_events.append(("SQL Validated", elapsed))
                if on_event:
                    on_event("step", {
                        "type": "sql_validated",
                        "step": "SQL Validated",
                        "message": "SQL query verified and approved",
                    })

            elif msg_name == "sql_db_query":
                tl_events.append(("Executing Query", elapsed))
                if on_event:
                    on_event("step", {
                        "type": "status",
                        "step": "Executing Query",
                        "message": f"Running SQL against {SQL_DIALECT.upper()}...",
                    })

    total_ms = int((time.time() - start) * 1000)
    logger.info("Agent run finished in %dms | steps=%d", total_ms, len(tl_events))
    return answer, sql_query, tl_events, token_usage, total_ms


def _execute_sql(sql_query: str) -> tuple[list[str], list[list[str]]]:
    logger.info("Executing SQL against DB: %s", sql_query)
    try:
        engine = build_engine(DATABASE_URL)
        columns, rows = run_sql(engine, sql_query)
        logger.info("SQL execution returned %d row(s), %d column(s)", len(rows), len(columns))
        return columns, rows
    except Exception as exc:
        logger.error("SQL execution error: %s", exc)
        return [], []


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/api/query")
def query(req: QueryRequest):
    """Synchronous endpoint — waits for the agent to finish, returns full JSON."""
    logger.info("=== /api/query received | question=%r ===", req.question)
    try:
        answer, sql_query, tl_events, token_usage, total_ms = _run_agent(req.question)
        columns, rows = _execute_sql(sql_query) if sql_query else ([], [])
        logger.info("=== /api/query done in %dms ===", total_ms)
        return _build_payload(answer, sql_query, tl_events, token_usage, total_ms, columns, rows)
    except Exception as exc:
        logger.exception("Query failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/query/stream")
async def query_stream(req: QueryRequest):
    """
    SSE streaming endpoint.

    Emits granular progress frames as the LangGraph agent runs — one frame
    per execution stage — then a final 'complete' frame with the full payload.

    The LangGraph agent is synchronous; it runs in a thread-pool worker so
    the async event loop is never blocked.  Events are relayed through an
    asyncio.Queue using loop.call_soon_threadsafe.
    """

    logger.info("=== /api/query/stream received | question=%r ===", req.question)

    async def event_gen() -> AsyncGenerator[str, None]:
        loop = asyncio.get_running_loop()
        queue: asyncio.Queue = asyncio.Queue()

        # ---- thread worker ----
        def _worker():
            def _relay(tag: str, payload: dict):
                logger.debug("SSE relay | tag=%s type=%s", tag, payload.get("type"))
                loop.call_soon_threadsafe(queue.put_nowait, (tag, payload))

            try:
                answer, sql_query, tl_events, token_usage, total_ms = _run_agent(
                    req.question,
                    on_event=lambda tag, p: _relay(tag, p),
                )

                # Execute SQL to get structured columns + rows for the UI
                columns, rows = _execute_sql(sql_query) if sql_query else ([], [])

                # Emit "Retrieved Results" step after SQL execution completes
                if sql_query:
                    tl_events.append(("Retrieved Results", total_ms))
                    _relay("step", {
                        "type": "results_retrieved",
                        "step": "Retrieved Results",
                        "rows": len(rows),
                        "columns": len(columns),
                        "message": (
                            f"Retrieved {len(rows)} row{'s' if len(rows) != 1 else ''} "
                            f"across {len(columns)} column{'s' if len(columns) != 1 else ''}"
                        ),
                    })

                _relay("step", {
                    "type": "sql_result",
                    "columns": columns,
                    "rows": rows,
                })

                payload = _build_payload(
                    answer, sql_query, tl_events, token_usage, total_ms, columns, rows
                )
                _relay("complete", {**payload, "type": "complete"})
                logger.info("=== /api/query/stream done in %dms ===", total_ms)

            except Exception as exc:
                logger.exception("Streaming agent error: %s", exc)
                loop.call_soon_threadsafe(
                    queue.put_nowait, ("error", {"type": "error", "message": str(exc)})
                )
            finally:
                loop.call_soon_threadsafe(queue.put_nowait, ("__done__", {}))

        # Start the worker thread
        asyncio.create_task(asyncio.to_thread(_worker))

        # Relay queue items as SSE frames until the worker signals done
        while True:
            tag, payload = await queue.get()
            if tag == "__done__":
                break
            yield _sse(payload)

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

import re
import logging

logger = logging.getLogger(__name__)


def to_text(content) -> str:
    """Normalise any LLM content shape to a plain Python string.

    Gemini 2.5+ returns structured content blocks instead of a bare string:
        [{"type": "text", "text": "...", "extras": {...}}]
    Passing that list to FastAPI would serialise it to a JSON array, and React
    cannot render a plain object as a child — causing runtime errors.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict):
                parts.append(block.get("text", ""))
            elif hasattr(block, "text"):
                parts.append(str(block.text))
        return "\n".join(p for p in parts if p).strip()
    if content is None:
        return ""
    return str(content)


def serialize_value(v) -> str:
    """Convert a single DB cell to a JSON-safe string."""
    if v is None:
        return ""
    try:
        return str(v)
    except Exception:
        return ""


def extract_tables(sql: str) -> list[str]:
    """Return unique table names referenced in a SQL string."""
    return list(set(re.findall(r"\b(?:FROM|JOIN)\s+(\w+)", sql, re.IGNORECASE)))

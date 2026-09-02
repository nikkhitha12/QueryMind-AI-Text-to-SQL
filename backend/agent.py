import logging
from langchain_community.utilities import SQLDatabase
from langchain.chat_models import init_chat_model
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langgraph.prebuilt import create_react_agent
from langsmith import Client
from config import DATABASE_URL, LLM_MODEL, LLM_TOP_K, SQL_DIALECT

logger = logging.getLogger(__name__)

# Module-level singletons — initialised once at startup via init_agent().
_agent = None
_sql_db: SQLDatabase | None = None


def init_agent() -> None:
    """Create and cache the LangGraph SQL agent and the SQLDatabase wrapper."""
    global _agent, _sql_db
    logger.info("Initialising SQL agent (model=%s)", LLM_MODEL)

    _sql_db = SQLDatabase.from_uri(DATABASE_URL)
    llm = init_chat_model(LLM_MODEL, model_provider="google_genai")
    toolkit = SQLDatabaseToolkit(db=_sql_db, llm=llm)

    lc = Client()
    tpl = lc.pull_prompt(
        "langchain-ai/sql-agent-system-prompt",
        dangerously_pull_public_prompt=True,
    )
    system_message = tpl.format(dialect=SQL_DIALECT, top_k=LLM_TOP_K)
    _agent = create_react_agent(llm, toolkit.get_tools(), prompt=system_message)
    logger.info("Agent ready — tables: %s", _sql_db.get_usable_table_names())


def get_agent():
    if _agent is None:
        init_agent()
    return _agent


def get_sql_db() -> SQLDatabase:
    if _sql_db is None:
        init_agent()
    return _sql_db

import logging
from fastapi import APIRouter, HTTPException
from langchain_community.utilities import SQLDatabase
from models import ConnectRequest
from db import build_engine, build_schema
from config import DATABASE_URL
import agent as agent_module

logger = logging.getLogger(__name__)
router = APIRouter()

_DRIVERS = {
    "mysql": "mysql+pymysql",
    "sqlite": "sqlite",
    "postgresql": "postgresql",
}


@router.get("/api/schema")
def get_schema():
    """Return the schema for the default (env-configured) database."""
    sql_db = agent_module.get_sql_db()
    table_names = sql_db.get_usable_table_names()
    engine = build_engine(DATABASE_URL)
    schema = build_schema(engine, table_names)
    return {"schema": schema, "tables": table_names}


@router.post("/api/connect")
def connect(req: ConnectRequest):
    """Test a user-supplied database connection and return its schema."""
    ssl_part = f"?sslmode={req.ssl}" if req.ssl and req.ssl != "disable" else ""
    driver = _DRIVERS.get(req.type.lower(), "postgresql")
    conn_str = (
        f"{driver}://{req.username}:{req.password}"
        f"@{req.host}:{req.port}/{req.database}{ssl_part}"
    )

    try:
        test_db = SQLDatabase.from_uri(conn_str)
        table_names = test_db.get_usable_table_names()
        engine = build_engine(conn_str)
        schema = build_schema(engine, table_names)
        logger.info("Connected to %r — tables: %s", req.database, table_names)
        return {"success": True, "schema": schema, "tables": table_names}
    except Exception as exc:
        logger.error("Connection failed for %r: %s", req.database, exc)
        raise HTTPException(status_code=400, detail=str(exc))

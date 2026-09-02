import logging
from sqlalchemy import create_engine, text, inspect as sa_inspect
from sqlalchemy.engine import Engine
from utils import serialize_value

logger = logging.getLogger(__name__)


def build_engine(conn_url: str) -> Engine:
    return create_engine(conn_url, pool_pre_ping=True)


def build_schema(engine: Engine, table_names: list[str]) -> dict:
    """Return a dict mapping table name → list of column descriptors."""
    inspector = sa_inspect(engine)
    schema: dict = {}
    for table in table_names:
        try:
            pk_cols = set(
                inspector.get_pk_constraint(table).get("constrained_columns", [])
            )
            fk_cols = {
                fk["constrained_columns"][0]
                for fk in inspector.get_foreign_keys(table)
                if fk.get("constrained_columns")
            }
            schema[table] = [
                {
                    "name": col["name"],
                    "type": str(col["type"]),
                    "pk": col["name"] in pk_cols,
                    "fk": col["name"] in fk_cols,
                    "nullable": bool(col.get("nullable", True)),
                }
                for col in inspector.get_columns(table)
            ]
        except Exception as exc:
            logger.warning("Cannot inspect table %r: %s", table, exc)
            schema[table] = []
    return schema


def run_sql(engine: Engine, sql: str) -> tuple[list[str], list[list[str]]]:
    """Execute SQL and return (column_names, rows) with all values as strings."""
    with engine.connect() as conn:
        result = conn.execute(text(sql))
        columns = list(result.keys())
        rows = [[serialize_value(v) for v in row] for row in result.fetchall()]
    return columns, rows

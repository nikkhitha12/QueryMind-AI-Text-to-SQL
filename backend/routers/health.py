from fastapi import APIRouter
from config import LLM_MODEL, SQL_DIALECT

router = APIRouter()


@router.get("/api/health")
def health():
    return {"status": "ok", "service": "QueryMind API"}


@router.get("/api/config")
def get_config():
    return {
        "model": LLM_MODEL,
        "dialect": SQL_DIALECT,
        "database": "PostgreSQL",
    }

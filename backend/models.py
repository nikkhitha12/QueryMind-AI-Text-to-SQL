from pydantic import BaseModel


class QueryRequest(BaseModel):
    question: str


class ConnectRequest(BaseModel):
    host: str
    port: int = 5432
    username: str
    password: str
    database: str
    ssl: str = "require"
    type: str = "PostgreSQL"

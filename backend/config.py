import os
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL connection — sourced from agent_pipeline.py
DATABASE_URL: str = os.environ["DATABASE_URL"]

# The Google AI SDK reads GOOGLE_API_KEY automatically from the environment;
# surfacing it here validates the value is present at startup.
GOOGLE_API_KEY: str = os.environ["GOOGLE_API_KEY"]

LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-2.5-flash")
LLM_TOP_K: int = int(os.getenv("LLM_TOP_K", "5"))
SQL_DIALECT: str = "postgresql"

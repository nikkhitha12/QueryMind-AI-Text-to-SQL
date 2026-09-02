# AI-Powered Text-to-SQL Agent

Ask your database questions in plain English — e.g. *"Who is the topper of the university?"* or *"Show students with CGPA above 9"* — and get back a natural-language answer plus the SQL and result rows that produced it.

The system uses a **LangGraph ReAct agent** backed by **Google Gemini** to inspect a database's schema, generate SQL, execute it, and explain the results. A FastAPI backend streams the agent's reasoning steps live to a React frontend, which shows the query, the generated SQL, the result table, and a step-by-step timeline of what the agent did.

## How it works

```
User question
    ↓
Gemini LLM (via LangChain)
    ↓
LangGraph ReAct Agent  ──uses──▶  SQLDatabaseToolkit
    │                              ├─ list tables
    │                              ├─ read schema
    │                              ├─ generate SQL
    │                              └─ validate & run SQL
    ↓
PostgreSQL database
    ↓
Natural-language answer + SQL + result rows
    ↓
Streamed to the frontend over SSE
```

The agent's system prompt is pulled from LangSmith (`langchain-ai/sql-agent-system-prompt`) at startup.

## Project structure

```
.
├── api.py                   # FastAPI app entry point (uvicorn api:app)
├── agent_pipeline.py         # Standalone script version of the agent (reference/prototype)
├── backend/
│   ├── agent.py              # Builds & caches the LangGraph SQL agent + SQLDatabase
│   ├── config.py              # Environment-driven settings (DB URL, LLM model, dialect)
│   ├── db.py                  # SQLAlchemy engine, schema introspection, raw SQL execution
│   ├── models.py               # Pydantic request models (QueryRequest, ConnectRequest)
│   ├── utils.py                 # Content normalization, value serialization, table extraction
│   └── routers/
│       ├── health.py            # GET /api/health, GET /api/config
│       ├── database.py          # GET /api/schema, POST /api/connect
│       └── query.py             # POST /api/query, POST /api/query/stream (SSE)
├── data/                     # Sample CSVs (students, branch, results) for the demo schema
└── frontend/                 # React + Vite single-page app
    └── src/
        ├── pages/            # ChatPage, DatabasePage, HistoryPage, SettingsPage
        ├── components/       # chat, database, layout, sql, table, timeline UI pieces
        ├── store/             # zustand stores (chat, db, config, theme)
        └── services/api.js    # fetch wrapper + SSE client for the backend
```

## Backend

- **`backend/agent.py`** — initializes a singleton LangGraph `create_react_agent` wired to a `SQLDatabaseToolkit`, so the agent and DB connection are built once at startup, not per-request.
- **`backend/routers/query.py`** — the core of the app:
  - `POST /api/query` runs the agent synchronously and returns the full answer, SQL, result rows, and a timeline of the steps taken.
  - `POST /api/query/stream` runs the same logic in a background thread and relays each agent step (tool call, schema read, SQL generation, validation, execution) as Server-Sent Events, so the UI can show live progress.
- **`backend/routers/database.py`** — `GET /api/schema` returns the configured database's schema; `POST /api/connect` lets a user test an arbitrary connection (MySQL/PostgreSQL/SQLite) and preview its schema.
- **`backend/db.py`** — raw SQLAlchemy helpers for schema introspection and running SQL with JSON-safe serialized results.

## Frontend

A React 19 + Vite app (Tailwind, zustand, react-router, Monaco editor, framer-motion) with four pages:

- **Chat** — ask questions, watch the agent's timeline stream in, view the answer, SQL, and result table.
- **Database** — connect to/inspect a database's schema.
- **History** — past queries.
- **Settings** — model/config info.

## Setup

### Backend

```bash
pip install langchain langchain-community langchain-google-genai langgraph \
            sqlalchemy psycopg2-binary pymysql google-generativeai \
            langsmith fastapi uvicorn python-dotenv pydantic
```

Create a `.env` file in the project root:

```
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
GOOGLE_API_KEY=<your-google-ai-api-key>
LANGSMITH_API_KEY=<your-langsmith-api-key>   # needed to pull the agent's system prompt
LLM_MODEL=gemini-2.5-flash                    # optional, this is the default
LLM_TOP_K=5                                    # optional, this is the default
```

Run the API:

```bash
uvicorn api:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API reference

| Method | Path                | Description                                      |
|--------|----------------------|---------------------------------------------------|
| GET    | `/api/health`        | Health check                                      |
| GET    | `/api/config`        | Current LLM model / dialect / database            |
| GET    | `/api/schema`        | Schema of the configured database                 |
| POST   | `/api/connect`       | Test a connection to a different database         |
| POST   | `/api/query`         | Ask a question, get the full answer synchronously |
| POST   | `/api/query/stream`  | Ask a question, stream progress via SSE           |

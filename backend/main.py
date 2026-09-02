"""
Entry point — run with:

    uvicorn api:app --reload --port 8000
"""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import agent
from routers import database, health, query

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Warm up the agent at startup so the first request isn't slow.
    # init_agent() is synchronous (DB connect + LangSmith prompt pull),
    # so we run it in a thread to avoid blocking the event loop.
    logger.info("Starting up — initializing SQL agent...")
    await asyncio.to_thread(agent.init_agent)
    logger.info("Startup complete.")
    yield
    logger.info("Shutting down.")


app = FastAPI(title="QueryMind API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(database.router)
app.include_router(query.router)

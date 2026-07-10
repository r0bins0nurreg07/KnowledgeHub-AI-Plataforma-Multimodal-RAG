from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.logging import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Ciclo de vida de la aplicación.
    """

    logger.info("===================================")
    logger.info("Starting KnowledgeHub AI...")
    logger.info("===================================")

    yield

    logger.info("===================================")
    logger.info("Stopping KnowledgeHub AI...")
    logger.info("===================================")
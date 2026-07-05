from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.logging import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestiona el ciclo de vida de la aplicación.
    """

    logger.info("Starting KnowledgeHub AI...")

    # Aquí inicializaremos recursos en el futuro
    # PostgreSQL
    # Qdrant
    # NVIDIA
    # Cache

    yield

    logger.info("Shutting down KnowledgeHub AI...")
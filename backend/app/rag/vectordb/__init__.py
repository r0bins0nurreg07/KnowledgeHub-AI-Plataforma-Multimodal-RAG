from uuid import UUID, uuid4

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PointStruct,
    VectorParams,
)

from app.core.config import settings
from app.rag.embeddings import EMBEDDING_DIMENSIONS

_client: AsyncQdrantClient | None = None


def get_client() -> AsyncQdrantClient:

    global _client

    if _client is None:
        _client = AsyncQdrantClient(url=settings.qdrant_url)

    return _client


async def ensure_collection() -> None:

    client = get_client()

    exists = await client.collection_exists(settings.qdrant_collection)

    if not exists:
        await client.create_collection(
            collection_name=settings.qdrant_collection,
            vectors_config=VectorParams(
                size=EMBEDDING_DIMENSIONS,
                distance=Distance.COSINE,
            ),
        )


async def upsert_chunks(
    document_id: UUID,
    workspace_id: UUID,
    chunks: list[str],
    vectors: list[list[float]],
) -> None:

    await ensure_collection()

    client = get_client()

    points = [
        PointStruct(
            id=str(uuid4()),
            vector=vector,
            payload={
                "document_id": str(document_id),
                "workspace_id": str(workspace_id),
                "chunk_index": index,
                "text": chunk,
            },
        )
        for index, (chunk, vector) in enumerate(zip(chunks, vectors))
    ]

    await client.upsert(
        collection_name=settings.qdrant_collection,
        points=points,
    )


async def delete_document_vectors(document_id: UUID) -> None:

    client = get_client()

    exists = await client.collection_exists(settings.qdrant_collection)

    if not exists:
        return

    await client.delete(
        collection_name=settings.qdrant_collection,
        points_selector=Filter(
            must=[
                FieldCondition(
                    key="document_id",
                    match=MatchValue(value=str(document_id)),
                )
            ]
        ),
    )

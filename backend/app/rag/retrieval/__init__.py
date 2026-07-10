from uuid import UUID

from qdrant_client.models import FieldCondition, Filter, MatchValue

from app.core.config import settings
from app.rag.embeddings import embed_texts
from app.rag.vectordb import get_client


async def retrieve_chunks(
    query: str,
    workspace_id: UUID,
    limit: int = 5,
) -> list[str]:

    vectors = await embed_texts([query])

    client = get_client()

    exists = await client.collection_exists(settings.qdrant_collection)

    if not exists:
        return []

    response = await client.query_points(
        collection_name=settings.qdrant_collection,
        query=vectors[0],
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="workspace_id",
                    match=MatchValue(value=str(workspace_id)),
                )
            ]
        ),
        limit=limit,
    )

    return [point.payload["text"] for point in response.points]

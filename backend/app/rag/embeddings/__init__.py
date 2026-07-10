from app.rag.openai_client import get_openai_client

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536


async def embed_texts(texts: list[str]) -> list[list[float]]:

    client = get_openai_client()

    response = await client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
    )

    return [item.embedding for item in response.data]

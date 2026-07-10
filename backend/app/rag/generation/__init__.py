from collections.abc import AsyncIterator

from app.core.config import settings
from app.rag.openai_client import get_openai_client
from app.rag.prompts import build_rag_messages


async def stream_answer(question: str, context_chunks: list[str]) -> AsyncIterator[str]:

    client = get_openai_client()

    messages = build_rag_messages(question, context_chunks)

    stream = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=messages,
        stream=True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta

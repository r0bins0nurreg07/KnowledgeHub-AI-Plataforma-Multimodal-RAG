SYSTEM_PROMPT = (
    "Eres un asistente que responde preguntas usando unicamente el "
    "contexto proporcionado, extraido de los documentos del usuario. "
    "Si el contexto no contiene informacion suficiente para responder, "
    "dilo claramente en vez de inventar una respuesta."
)


def build_rag_messages(question: str, context_chunks: list[str]) -> list[dict[str, str]]:

    if context_chunks:
        context = "\n\n---\n\n".join(context_chunks)
    else:
        context = "(no se encontro contexto relevante en los documentos)"

    user_prompt = (
        f"Contexto:\n{context}\n\n"
        f"Pregunta: {question}"
    )

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

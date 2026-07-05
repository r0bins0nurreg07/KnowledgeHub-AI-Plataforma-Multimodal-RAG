from fastapi import APIRouter

router = APIRouter(
    prefix="",
    tags=["Health"]
)


@router.get("/")
async def root():
    """
    Endpoint principal de la API.
    """
    return {
        "message": "Bienvenido a KnowledgeHub AI"
    }


@router.get("/health")
async def health():
    """
    Verifica el estado de la aplicación.
    """
    return {
        "status": "healthy"
    }
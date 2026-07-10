import json
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.repositories.chat_repository import ChatRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.chat import AskRequest, ChatResponse
from app.schemas.message import MessageResponse
from app.services.chat_service import ChatService
from app.services.workspace_service import WorkspaceService

router = APIRouter(prefix="/chat", tags=["Chat"])


def _build_service(db: AsyncSession) -> ChatService:

    workspace_service = WorkspaceService(WorkspaceRepository(db))

    return ChatService(
        ChatRepository(db),
        MessageRepository(db),
        workspace_service,
    )


@router.post("/ask")
async def ask(
    request: AskRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    service = _build_service(db)

    chat, sources = await service.prepare_ask(current_user.id, request)

    async def event_stream():

        yield json.dumps({"type": "meta", "chat_id": str(chat.id)}) + "\n"

        async for token in service.stream_ask(chat, request.question, sources):
            yield json.dumps({"type": "token", "text": token}) + "\n"

        yield json.dumps({"type": "sources", "sources": sources}) + "\n"

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")


@router.get("", response_model=list[ChatResponse])
async def list_chats(
    workspace_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    service = _build_service(db)

    return await service.list_chats(workspace_id, current_user.id)


@router.get("/{chat_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    chat_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    service = _build_service(db)

    return await service.get_messages(chat_id, current_user.id)

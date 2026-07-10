from collections.abc import AsyncIterator
from uuid import UUID

from app.core.exceptions import NotFoundException
from app.models.chat import Chat
from app.models.message import Message, MessageRole
from app.rag.generation import stream_answer
from app.rag.retrieval import retrieve_chunks
from app.repositories.chat_repository import ChatRepository
from app.repositories.message_repository import MessageRepository
from app.schemas.chat import AskRequest
from app.services.workspace_service import WorkspaceService


class ChatService:

    def __init__(
        self,
        chat_repository: ChatRepository,
        message_repository: MessageRepository,
        workspace_service: WorkspaceService,
    ):
        self.chat_repository = chat_repository
        self.message_repository = message_repository
        self.workspace_service = workspace_service

    async def prepare_ask(
        self,
        owner_id: UUID,
        request: AskRequest,
    ) -> tuple[Chat, list[str]]:

        await self.workspace_service.get(request.workspace_id, owner_id)

        if request.chat_id:

            chat = await self.chat_repository.get_by_id(request.chat_id)

            if chat is None or chat.workspace_id != request.workspace_id:
                raise NotFoundException("Chat not found")

        else:

            chat = Chat(
                title=request.question[:80],
                workspace_id=request.workspace_id,
            )
            chat = await self.chat_repository.create(chat)

        await self.message_repository.create(
            Message(
                role=MessageRole.USER,
                content=request.question,
                chat_id=chat.id,
            )
        )

        sources = await retrieve_chunks(request.question, request.workspace_id)

        return chat, sources

    async def stream_ask(
        self,
        chat: Chat,
        question: str,
        sources: list[str],
    ) -> AsyncIterator[str]:

        answer_parts: list[str] = []

        async for delta in stream_answer(question, sources):
            answer_parts.append(delta)
            yield delta

        await self.message_repository.create(
            Message(
                role=MessageRole.ASSISTANT,
                content="".join(answer_parts),
                chat_id=chat.id,
            )
        )

    async def list_chats(self, workspace_id: UUID, owner_id: UUID) -> list[Chat]:

        await self.workspace_service.get(workspace_id, owner_id)

        return await self.chat_repository.list_by_workspace(workspace_id)

    async def get_messages(self, chat_id: UUID, owner_id: UUID) -> list[Message]:

        chat = await self.chat_repository.get_by_id(chat_id)

        if chat is None:
            raise NotFoundException("Chat not found")

        await self.workspace_service.get(chat.workspace_id, owner_id)

        return await self.message_repository.list_by_chat(chat_id)

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat import Chat


class ChatRepository:

    def __init__(self, db: AsyncSession):

        self.db = db

    async def create(self, chat: Chat) -> Chat:

        self.db.add(chat)

        await self.db.commit()

        await self.db.refresh(chat)

        return chat

    async def get_by_id(self, chat_id: UUID):

        result = await self.db.execute(
            select(Chat)
            .where(Chat.id == chat_id)
            .options(selectinload(Chat.messages))
        )

        return result.scalar_one_or_none()

    async def list_by_workspace(self, workspace_id: UUID):

        result = await self.db.execute(
            select(Chat)
            .where(Chat.workspace_id == workspace_id)
            .order_by(Chat.created_at.desc())
        )

        return list(result.scalars().all())

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document


class DocumentRepository:

    def __init__(self, db: AsyncSession):

        self.db = db

    async def create(self, document: Document) -> Document:

        self.db.add(document)

        await self.db.commit()

        await self.db.refresh(document)

        return document

    async def get_by_id(self, document_id: UUID):

        result = await self.db.execute(
            select(Document).where(Document.id == document_id)
        )

        return result.scalar_one_or_none()

    async def list_by_workspace(self, workspace_id: UUID):

        result = await self.db.execute(
            select(Document)
            .where(Document.workspace_id == workspace_id)
            .order_by(Document.created_at.desc())
        )

        return list(result.scalars().all())

    async def save(self, document: Document) -> Document:

        await self.db.commit()

        await self.db.refresh(document)

        return document

    async def delete(self, document: Document) -> None:

        await self.db.delete(document)

        await self.db.commit()

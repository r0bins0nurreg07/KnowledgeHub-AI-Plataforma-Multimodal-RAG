from pathlib import Path
from uuid import UUID

from app.core.config import settings
from app.core.exceptions import (
    BadRequestException,
    NotFoundException,
    PayloadTooLargeException,
)
from app.core.logging import logger
from app.models.document import Document, DocumentStatus
from app.rag.chunking import chunk_text
from app.rag.embeddings import embed_texts
from app.rag.loaders import SUPPORTED_MIME_TYPES, extract_text
from app.rag.vectordb import delete_document_vectors, upsert_chunks
from app.repositories.document_repository import DocumentRepository
from app.services.workspace_service import WorkspaceService
from app.storage.local import build_stored_filename, delete_file, save_file


class DocumentService:

    def __init__(
        self,
        repository: DocumentRepository,
        workspace_service: WorkspaceService,
    ):
        self.repository = repository
        self.workspace_service = workspace_service

    async def upload(
        self,
        workspace_id: UUID,
        owner_id: UUID,
        filename: str,
        mime_type: str,
        content: bytes,
    ) -> tuple[Document, int]:

        await self.workspace_service.get(workspace_id, owner_id)

        if mime_type not in SUPPORTED_MIME_TYPES:

            raise BadRequestException(f"Unsupported file type: {mime_type}")

        max_size_bytes = settings.max_upload_size_mb * 1024 * 1024

        if len(content) > max_size_bytes:

            raise PayloadTooLargeException(
                f"File exceeds the {settings.max_upload_size_mb}MB upload limit"
            )

        stored_filename = build_stored_filename(filename)

        file_path = save_file(workspace_id, stored_filename, content)

        document = Document(
            filename=filename,
            stored_filename=stored_filename,
            file_path=file_path,
            extension=Path(filename).suffix.lstrip("."),
            mime_type=mime_type,
            file_size=len(content),
            workspace_id=workspace_id,
            uploaded_by=owner_id,
        )

        document = await self.repository.create(document)

        chunks_extracted = 0

        try:
            text = extract_text(file_path, mime_type)
            chunks = chunk_text(text)

            if chunks:
                vectors = await embed_texts(chunks)
                await upsert_chunks(document.id, workspace_id, chunks, vectors)

            chunks_extracted = len(chunks)
            document.status = DocumentStatus.INDEXED

        except Exception:

            logger.exception(
                "Fallo al procesar el documento %s", document.id
            )
            document.status = DocumentStatus.ERROR

        document = await self.repository.save(document)

        return document, chunks_extracted

    async def list_mine(self, workspace_id: UUID, owner_id: UUID) -> list[Document]:

        await self.workspace_service.get(workspace_id, owner_id)

        return await self.repository.list_by_workspace(workspace_id)

    async def get(self, document_id: UUID, owner_id: UUID) -> Document:

        document = await self.repository.get_by_id(document_id)

        if document is None:

            raise NotFoundException("Document not found")

        await self.workspace_service.get(document.workspace_id, owner_id)

        return document

    async def delete(self, document_id: UUID, owner_id: UUID) -> None:

        document = await self.get(document_id, owner_id)

        delete_file(document.file_path)

        await delete_document_vectors(document.id)

        await self.repository.delete(document)

from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.exceptions import PayloadTooLargeException
from app.db.dependencies import get_db
from app.models.user import User
from app.repositories.document_repository import DocumentRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.document import DocumentResponse, DocumentUploadResponse
from app.services.document_service import DocumentService
from app.services.workspace_service import WorkspaceService

router = APIRouter(prefix="/documents", tags=["Documents"])


def _build_service(db: AsyncSession) -> DocumentService:

    workspace_service = WorkspaceService(WorkspaceRepository(db))

    return DocumentService(DocumentRepository(db), workspace_service)


@router.post(
    "",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    request: Request,
    workspace_id: UUID = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    max_size_bytes = settings.max_upload_size_mb * 1024 * 1024

    content_length = request.headers.get("content-length")

    if content_length is not None and int(content_length) > max_size_bytes:

        raise PayloadTooLargeException(
            f"File exceeds the {settings.max_upload_size_mb}MB upload limit"
        )

    service = _build_service(db)

    content = await file.read()

    document, chunks_extracted = await service.upload(
        workspace_id=workspace_id,
        owner_id=current_user.id,
        filename=file.filename,
        mime_type=file.content_type,
        content=content,
    )

    return DocumentUploadResponse(
        **DocumentResponse.model_validate(document).model_dump(),
        chunks_extracted=chunks_extracted,
    )


@router.get(
    "",
    response_model=list[DocumentResponse],
)
async def list_documents(
    workspace_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    service = _build_service(db)

    return await service.list_mine(workspace_id, current_user.id)


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
async def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    service = _build_service(db)

    return await service.get(document_id, current_user.id)


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    service = _build_service(db)

    await service.delete(document_id, current_user.id)

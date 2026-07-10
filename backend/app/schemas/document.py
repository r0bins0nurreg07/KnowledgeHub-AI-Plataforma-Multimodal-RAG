from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.document import DocumentStatus


class DocumentResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    filename: str
    extension: str
    mime_type: str
    file_size: int
    status: DocumentStatus
    workspace_id: UUID
    uploaded_by: UUID
    created_at: datetime


class DocumentUploadResponse(DocumentResponse):

    chunks_extracted: int

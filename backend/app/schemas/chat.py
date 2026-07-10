from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ChatResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    workspace_id: UUID
    created_at: datetime


class AskRequest(BaseModel):

    workspace_id: UUID
    question: str
    chat_id: UUID | None = None

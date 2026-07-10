from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.message import MessageRole


class MessageResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    role: MessageRole
    content: str
    chat_id: UUID
    created_at: datetime

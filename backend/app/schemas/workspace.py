from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


def _validate_name(value: str) -> str:

    value = value.strip()

    if not value:
        raise ValueError("name must not be empty")

    return value


class WorkspaceCreate(BaseModel):

    name: str

    _validate_name = field_validator("name")(_validate_name)


class WorkspaceUpdate(BaseModel):

    name: str

    _validate_name = field_validator("name")(_validate_name)


class WorkspaceResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    owner_id: UUID
    created_at: datetime

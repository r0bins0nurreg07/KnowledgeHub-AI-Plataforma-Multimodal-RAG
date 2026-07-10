from uuid import UUID

from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.workspace import Workspace
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate


class WorkspaceService:

    def __init__(self, repository: WorkspaceRepository):

        self.repository = repository

    async def create(self, owner_id: UUID, request: WorkspaceCreate) -> Workspace:

        workspace = Workspace(
            name=request.name,
            owner_id=owner_id,
        )

        return await self.repository.create(workspace)

    async def list_mine(self, owner_id: UUID) -> list[Workspace]:

        return await self.repository.list_by_owner(owner_id)

    async def get(self, workspace_id: UUID, owner_id: UUID) -> Workspace:

        workspace = await self.repository.get_by_id(workspace_id)

        if workspace is None:

            raise NotFoundException("Workspace not found")

        if workspace.owner_id != owner_id:

            raise ForbiddenException()

        return workspace

    async def update(
        self,
        workspace_id: UUID,
        owner_id: UUID,
        request: WorkspaceUpdate,
    ) -> Workspace:

        workspace = await self.get(workspace_id, owner_id)

        workspace.name = request.name

        return await self.repository.save(workspace)

    async def delete(self, workspace_id: UUID, owner_id: UUID) -> None:

        workspace = await self.get(workspace_id, owner_id)

        await self.repository.delete(workspace)

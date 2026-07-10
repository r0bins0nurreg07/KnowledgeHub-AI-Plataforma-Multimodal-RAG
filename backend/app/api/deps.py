from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from app.db.dependencies import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:

    payload = decode_access_token(credentials.credentials)

    if payload is None:
        raise UnauthorizedException()

    user_id = payload.get("sub")

    if user_id is None:
        raise UnauthorizedException()

    repository = UserRepository(db)

    user = await repository.get_by_id(user_id)

    if user is None:
        raise UnauthorizedException()

    return user

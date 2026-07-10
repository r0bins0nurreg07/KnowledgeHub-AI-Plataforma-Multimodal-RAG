from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.dependencies import get_db
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    Token,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=UserResponse,
)
async def register(
    request: UserRegister,
    db: AsyncSession = Depends(get_db),
):

    repository = UserRepository(db)

    service = AuthService(repository)

    return await service.register(request)


@router.post(
    "/login",
    response_model=Token,
)
async def login(
    request: UserLogin,
    db: AsyncSession = Depends(get_db),
):

    repository = UserRepository(db)

    service = AuthService(repository)

    return await service.login(request)

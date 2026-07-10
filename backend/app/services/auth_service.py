from sqlalchemy.exc import IntegrityError

from app.core.exceptions import BadRequestException, UnauthorizedException
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserLogin, UserRegister


class AuthService:

    def __init__(self, repository: UserRepository):

        self.repository = repository

    async def register(self, request: UserRegister):

        exists = await self.repository.get_by_email(
            request.email
        )

        if exists:

            raise BadRequestException("Email already exists")

        user = User(

            username=request.username,

            email=request.email,

            password=hash_password(
                request.password
            ),
        )

        try:
            return await self.repository.create(user)

        except IntegrityError:

            await self.repository.db.rollback()

            raise BadRequestException("Email or username already exists")

    async def login(self, request: UserLogin):

        user = await self.repository.get_by_email(
            request.email
        )

        if not user:

            raise UnauthorizedException()

        if not verify_password(
            request.password,
            user.password,
        ):

            raise UnauthorizedException()

        token = create_access_token(
            str(user.id)
        )

        return {
            "access_token": token,
            "token_type": "bearer",
        }
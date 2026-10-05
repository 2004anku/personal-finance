from fastapi import HTTPException, status

from expense_tracker.core.security import create_access_token
from expense_tracker.features.auth.schema import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
     UpdateProfileRequest,
)
from expense_tracker.features.auth.service import (
    hash_password,
    verify_password,
)
from expense_tracker.features.user.model import User
from expense_tracker.features.user.schema import UserResponse
from expense_tracker.features.user.service import (
    create_user,
    get_user_by_email,
    update_user_profile,
)


async def register_user(request: RegisterRequest) -> UserResponse:
    existing_user = await get_user_by_email(request.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    password_hash = hash_password(request.password)

    user = await create_user(
        name=request.name,
        email=request.email,
        password_hash=password_hash,
    )

    return UserResponse.model_validate(user)


async def login_user(request: LoginRequest) -> TokenResponse:
    user = await get_user_by_email(request.email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    password_valid = verify_password(
        request.password,
        user.password_hash,
    )

    if not password_valid:
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
        )

    access_token = create_access_token(
        subject=str(user.id),
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )
async def update_current_user_profile(
    user: User,
    request: UpdateProfileRequest,
) -> UserResponse:
    existing_user = await get_user_by_email(request.email)

    if existing_user and existing_user.id != user.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    updated_user = await update_user_profile(
        user=user,
        name=request.name,
        email=request.email,
    )

    return UserResponse.model_validate(updated_user)

async def get_current_user_info(user: User) -> UserResponse:
    return UserResponse.model_validate(user)
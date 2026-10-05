from fastapi import APIRouter, Depends

from expense_tracker.dependencies import get_current_user
from expense_tracker.features.auth.controller import (
    get_current_user_info,
    login_user,
    register_user,
    update_current_user_profile,
)
from expense_tracker.features.auth.schema import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UpdateProfileRequest,
)
from expense_tracker.features.user.model import User
from expense_tracker.features.user.schema import UserResponse


router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post(
    "/register",
    response_model=UserResponse,
)
async def register(request: RegisterRequest) -> UserResponse:
    return await register_user(request)


@router.post(
    "/login",
    response_model=TokenResponse,
)
async def login(request: LoginRequest) -> TokenResponse:
    return await login_user(request)


@router.get(
    "/me",
    response_model=UserResponse,
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return await get_current_user_info(current_user)

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return await update_current_user_profile(
        user=current_user,
        request=request,
    )
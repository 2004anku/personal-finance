
from fastapi import APIRouter, Depends

from fastapi import APIRouter, Depends, HTTPException, status

from expense_tracker.dependencies import (
    get_current_user,
    get_request_context,
)
from expense_tracker.features.auth.controller import (
    change_current_user_password,
    get_current_user_info,
    login_user,
    register_user,
    update_current_user_profile,
)
from expense_tracker.features.auth.schema import (
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UpdateProfileRequest,
)
from expense_tracker.features.user.model import User
from expense_tracker.features.user.schema import UserResponse


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse)
async def register(request: RegisterRequest):
    return await register_user(request)


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    return await login_user(request)


@router.get("/me")
async def get_me(
    context: dict = Depends(get_request_context),
):
    if context["type"] == "demo":
        return {
            "name": "Demo User",
            "email": "demo@example.com",
            "is_demo": True,
        }

    return await get_current_user_info(context["user"])


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
):
    return await update_current_user_profile(
        user=current_user,
        request=request,
    )


@router.patch("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    return await change_current_user_password(
        user=current_user,
        request=request,
    )

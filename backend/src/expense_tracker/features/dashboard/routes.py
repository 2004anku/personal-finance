from fastapi import APIRouter, Depends

from expense_tracker.dependencies import get_current_user
from expense_tracker.features.dashboard.controller import (
    get_dashboard_controller,
)
from expense_tracker.features.dashboard.model import DashboardResponse
from expense_tracker.features.user.model import User

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "",
    response_model=DashboardResponse,
)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
) -> DashboardResponse:
    return await get_dashboard_controller(
        user_id=current_user.id,
    )


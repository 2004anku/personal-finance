
from fastapi import APIRouter, Depends

from expense_tracker.dependencies import get_request_context
from expense_tracker.features.dashboard.controller import (
    get_dashboard_controller,
)
from expense_tracker.features.dashboard.model import DashboardResponse
from expense_tracker.features.dashboard.service import get_demo_dashboard_data


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "",
    response_model=DashboardResponse,
)
async def get_dashboard(
    context: dict = Depends(get_request_context),
) -> DashboardResponse:
    if context["type"] == "demo":
        data = get_demo_dashboard_data(context["session"])
        return DashboardResponse.model_validate(data)

    return await get_dashboard_controller(
        user_id=context["user"].id,
    )

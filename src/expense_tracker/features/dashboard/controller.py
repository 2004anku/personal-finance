import logging

from fastapi import HTTPException, status

from expense_tracker.features.dashboard.model import DashboardResponse
from expense_tracker.features.dashboard.service import get_dashboard_data

logger = logging.getLogger(__name__)


async def get_dashboard_controller(user_id) -> DashboardResponse:
    try:
        dashboard_data = await get_dashboard_data(user_id=user_id)

        return DashboardResponse.model_validate(dashboard_data)

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Error getting dashboard for user_id=%s",
            user_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get dashboard",
        )
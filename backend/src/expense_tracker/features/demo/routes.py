
from fastapi import APIRouter

from expense_tracker.features.demo.session import create_demo_session


router = APIRouter(
    prefix="/demo",
    tags=["Demo"],
)


@router.post("/start")
async def start_demo():
    return create_demo_session()

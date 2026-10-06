from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, Response, status

from expense_tracker.dependencies import get_current_user
from expense_tracker.features.income.controller import (
    create_income_controller,
    delete_income_controller,
    get_income_controller,
    get_incomes_controller,
    update_income_controller,
)
from expense_tracker.features.income.schema import (
    IncomeCreate,
    IncomeResponse,
    IncomeUpdate,
)
from expense_tracker.features.income.service import IncomeDateRange
from expense_tracker.features.user.model import User


router = APIRouter(
    prefix="/incomes",
    tags=["Incomes"],
)


@router.post(
    "",
    response_model=IncomeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_income(
    data: IncomeCreate,
    current_user: User = Depends(get_current_user),
) -> IncomeResponse:
    return await create_income_controller(
        user_id=current_user.id,
        data=data,
    )


@router.get(
    "",
    response_model=list[IncomeResponse],
)
async def get_incomes(
    date_range: IncomeDateRange = IncomeDateRange.ALL,
    current_user: User = Depends(get_current_user),
) -> list[IncomeResponse]:
    return await get_incomes_controller(
        user_id=current_user.id,
        date_range=date_range,
    )


@router.get(
    "/{income_id}",
    response_model=IncomeResponse,
)
async def get_income(
    income_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> IncomeResponse:
    return await get_income_controller(
        income_id=income_id,
        user_id=current_user.id,
    )


@router.put(
    "/{income_id}",
    response_model=IncomeResponse,
)
async def update_income(
    income_id: PydanticObjectId,
    data: IncomeUpdate,
    current_user: User = Depends(get_current_user),
) -> IncomeResponse:
    return await update_income_controller(
        income_id=income_id,
        user_id=current_user.id,
        data=data,
    )


@router.delete(
    "/{income_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_income(
    income_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> Response:
    await delete_income_controller(
        income_id=income_id,
        user_id=current_user.id,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
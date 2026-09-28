from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, Response, status

from expense_tracker.dependencies import get_current_user
from expense_tracker.features.expense.controller import (
    create_expense_controller,
    delete_expense_controller,
    get_expense_controller,
    get_expenses_controller,
    update_expense_controller,
)
from expense_tracker.features.expense.schema import (
    ExpenseCreate,
    ExpenseResponse,
    ExpenseUpdate,
)
from expense_tracker.features.user.model import User


router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"],
)


@router.post(
    "",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_expense(
    data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
) -> ExpenseResponse:
    return await create_expense_controller(
        user_id=current_user.id,
        data=data,
    )


@router.get(
    "",
    response_model=list[ExpenseResponse],
)
async def get_expenses(
    current_user: User = Depends(get_current_user),
) -> list[ExpenseResponse]:
    return await get_expenses_controller(
        user_id=current_user.id,
    )


@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse,
)
async def get_expense(
    expense_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> ExpenseResponse:
    return await get_expense_controller(
        expense_id=expense_id,
        user_id=current_user.id,
    )


@router.put(
    "/{expense_id}",
    response_model=ExpenseResponse,
)
async def update_expense(
    expense_id: PydanticObjectId,
    data: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
) -> ExpenseResponse:
    return await update_expense_controller(
        expense_id=expense_id,
        user_id=current_user.id,
        data=data,
    )


@router.delete(
    "/{expense_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_expense(
    expense_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
) -> Response:
    await delete_expense_controller(
        expense_id=expense_id,
        user_id=current_user.id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
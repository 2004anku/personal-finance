from beanie import PydanticObjectId
from fastapi import HTTPException, status

from expense_tracker.features.expense.schema import (
    ExpenseCreate,
    ExpenseResponse,
    ExpenseUpdate,
)
from expense_tracker.features.expense.service import (
    create_expense,
    delete_expense,
    get_expense_by_id,
    get_expenses,
    update_expense,
)


async def create_expense_controller(
    user_id: PydanticObjectId,
    data: ExpenseCreate,
) -> ExpenseResponse:
    expense = await create_expense(
        user_id=user_id,
        data=data,
    )

    return ExpenseResponse.model_validate(expense)


async def get_expenses_controller(
    user_id: PydanticObjectId,
) -> list[ExpenseResponse]:
    expenses = await get_expenses(
        user_id=user_id,
    )

    return [
        ExpenseResponse.model_validate(expense)
        for expense in expenses
    ]


async def get_expense_controller(
    expense_id: PydanticObjectId,
    user_id: PydanticObjectId,
) -> ExpenseResponse:
    expense = await get_expense_by_id(
        expense_id=expense_id,
        user_id=user_id,
    )

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )

    return ExpenseResponse.model_validate(expense)


async def update_expense_controller(
    expense_id: PydanticObjectId,
    user_id: PydanticObjectId,
    data: ExpenseUpdate,
) -> ExpenseResponse:
    expense = await get_expense_by_id(
        expense_id=expense_id,
        user_id=user_id,
    )

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )

    updated_expense = await update_expense(
        expense=expense,
        data=data,
    )

    return ExpenseResponse.model_validate(updated_expense)


async def delete_expense_controller(
    expense_id: PydanticObjectId,
    user_id: PydanticObjectId,
) -> None:
    expense = await get_expense_by_id(
        expense_id=expense_id,
        user_id=user_id,
    )

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )

    await delete_expense(expense)
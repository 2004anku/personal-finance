import logging

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from expense_tracker.features.expense.schema import (
    ExpenseCreate,
    ExpenseResponse,
    ExpenseUpdate,
)
from expense_tracker.features.expense.service import (
    ExpenseDateRange,
    create_expense,
    delete_expense,
    get_expense_by_id,
    get_expenses,
    update_expense,
)


logger = logging.getLogger(__name__)


async def create_expense_controller(
    user_id: PydanticObjectId,
    data: ExpenseCreate,
) -> ExpenseResponse:
    try:
        expense = await create_expense(
            user_id=user_id,
            data=data,
        )

        return ExpenseResponse.model_validate(expense)

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Error creating expense for user_id=%s",
            user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create expense",
        )


async def get_expenses_controller(
    user_id: PydanticObjectId,
    date_range: ExpenseDateRange = ExpenseDateRange.ALL,
) -> list[ExpenseResponse]:
    try:
        expenses = await get_expenses(
            user_id=user_id,
            date_range=date_range,
        )

        return [
            ExpenseResponse.model_validate(expense)
            for expense in expenses
        ]

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Error fetching expenses for user_id=%s",
            user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch expenses",
        )


async def get_expense_controller(
    expense_id: PydanticObjectId,
    user_id: PydanticObjectId,
) -> ExpenseResponse:
    try:
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

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Error fetching expense_id=%s for user_id=%s",
            expense_id,
            user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch expense",
        )


async def update_expense_controller(
    expense_id: PydanticObjectId,
    user_id: PydanticObjectId,
    data: ExpenseUpdate,
) -> ExpenseResponse:
    try:
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

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Error updating expense_id=%s for user_id=%s",
            expense_id,
            user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update expense",
        )


async def delete_expense_controller(
    expense_id: PydanticObjectId,
    user_id: PydanticObjectId,
) -> None:
    try:
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

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Error deleting expense_id=%s for user_id=%s",
            expense_id,
            user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete expense",
        )
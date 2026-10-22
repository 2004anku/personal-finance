
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Response, status

from expense_tracker.dependencies import get_current_user, get_request_context
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
from expense_tracker.features.expense.service import (
    ExpenseDateRange,
    get_date_range,
)
from expense_tracker.features.demo.service import (
    create_transaction,
    delete_transaction,
    list_transactions,
    update_transaction,
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
    context: dict = Depends(get_request_context),
) -> ExpenseResponse:
    if context["type"] == "demo":
        transaction = create_transaction(
            context["session"],
            "expenses",
            data.model_dump(mode="python"),
        )
        return ExpenseResponse.model_validate(transaction)

    return await create_expense_controller(
        user_id=context["user"].id,
        data=data,
    )


@router.get(
    "",
    response_model=list[ExpenseResponse],
)
async def get_expenses(
    date_range: ExpenseDateRange = ExpenseDateRange.ALL,
    context: dict = Depends(get_request_context),
) -> list[ExpenseResponse]:
    if context["type"] == "demo":
        transactions = list_transactions(
            context["session"],
            "expenses",
        )

        start_date, end_date = get_date_range(date_range)

        if start_date is not None:
            transactions = [
                item for item in transactions
                if item["expense_date"] >= start_date
            ]

        if end_date is not None:
            transactions = [
                item for item in transactions
                if item["expense_date"] <= end_date
            ]

        transactions.sort(
            key=lambda item: item["expense_date"],
            reverse=True,
        )

        return [
            ExpenseResponse.model_validate(item)
            for item in transactions
        ]

    return await get_expenses_controller(
        user_id=context["user"].id,
        date_range=date_range,
    )


@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse,
)
async def get_expense(
    expense_id: PydanticObjectId,
    context: dict = Depends(get_request_context),
) -> ExpenseResponse:
    if context["type"] == "demo":
        transaction = next(
            (
                item for item in list_transactions(
                    context["session"],
                    "expenses",
                )
                if item["id"] == str(expense_id)
            ),
            None,
        )

        if transaction is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found",
            )

        return ExpenseResponse.model_validate(transaction)

    return await get_expense_controller(
        expense_id=expense_id,
        user_id=context["user"].id,
    )


@router.put(
    "/{expense_id}",
    response_model=ExpenseResponse,
)
async def update_expense(
    expense_id: PydanticObjectId,
    data: ExpenseUpdate,
    context: dict = Depends(get_request_context),
) -> ExpenseResponse:
    if context["type"] == "demo":
        transaction = update_transaction(
            context["session"],
            "expenses",
            str(expense_id),
            data.model_dump(exclude_unset=True, mode="python"),
        )

        if transaction is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found",
            )

        return ExpenseResponse.model_validate(transaction)

    return await update_expense_controller(
        expense_id=expense_id,
        user_id=context["user"].id,
        data=data,
    )


@router.delete(
    "/{expense_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_expense(
    expense_id: PydanticObjectId,
    context: dict = Depends(get_request_context),
) -> Response:
    if context["type"] == "demo":
        deleted = delete_transaction(
            context["session"],
            "expenses",
            str(expense_id),
        )

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found",
            )
    else:
        await delete_expense_controller(
            expense_id=expense_id,
            user_id=context["user"].id,
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)

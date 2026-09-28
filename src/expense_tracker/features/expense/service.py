from datetime import date

from beanie import PydanticObjectId

from expense_tracker.features.expense.model import Expense
from expense_tracker.features.expense.schema import (
    ExpenseCreate,
    ExpenseUpdate,
)


async def create_expense(
    user_id: PydanticObjectId,
    data: ExpenseCreate,
) -> Expense:
    expense = Expense(
        user_id=user_id,
        amount=data.amount,
        category=data.category,
        note=data.note,
        payment_mode=data.payment_mode,
        expense_date=data.expense_date,
    )

    await expense.insert()

    return expense


async def get_expenses(
    user_id: PydanticObjectId,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[Expense]:
    query = Expense.find(
        Expense.user_id == user_id,
    )

    if start_date is not None:
        query = query.find(
            Expense.expense_date >= start_date,
        )

    if end_date is not None:
        query = query.find(
            Expense.expense_date <= end_date,
        )

    return await query.sort(
        -Expense.expense_date,
    ).to_list()


async def get_expense_by_id(
    expense_id: PydanticObjectId,
    user_id: PydanticObjectId,
) -> Expense | None:
    return await Expense.find_one(
        Expense.id == expense_id,
        Expense.user_id == user_id,
    )


async def update_expense(
    expense: Expense,
    data: ExpenseUpdate,
) -> Expense:
    update_data = data.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():
        setattr(expense, field, value)

    expense.updated_at = __import__(
        "datetime"
    ).datetime.now(
        __import__("datetime").timezone.utc
    )

    await expense.save()

    return expense


async def delete_expense(
    expense: Expense,
) -> None:
    await expense.delete()
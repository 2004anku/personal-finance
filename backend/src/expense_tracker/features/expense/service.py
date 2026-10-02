from calendar import monthrange
from datetime import date
from enum import Enum

from beanie import PydanticObjectId

from expense_tracker.features.expense.model import Expense
from expense_tracker.features.expense.schema import (
    ExpenseCreate,
    ExpenseUpdate,
)


class ExpenseDateRange(str, Enum):
    ALL = "all"
    THIS_MONTH = "this_month"
    LAST_6_MONTHS = "last_6_months"
    LAST_YEAR = "last_year"


def subtract_months(
    current_date: date,
    months: int,
) -> date:
    total_months = (
        current_date.year * 12
        + current_date.month
        - 1
    )

    target_months = total_months - months

    year = target_months // 12
    month = target_months % 12 + 1

    day = min(
        current_date.day,
        monthrange(year, month)[1],
    )

    return date(
        year,
        month,
        day,
    )


def get_date_range(
    date_range: ExpenseDateRange,
) -> tuple[date | None, date | None]:
    today = date.today()

    if date_range == ExpenseDateRange.ALL:
        return None, None

    if date_range == ExpenseDateRange.THIS_MONTH:
        start_date = today.replace(day=1)

        return start_date, today

    if date_range == ExpenseDateRange.LAST_6_MONTHS:
        start_date = subtract_months(
            today,
            6,
        )

        return start_date, today

    if date_range == ExpenseDateRange.LAST_YEAR:
        start_date = subtract_months(
            today,
            12,
        )

        return start_date, today

    return None, None


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
    date_range: ExpenseDateRange = ExpenseDateRange.ALL,
) -> list[Expense]:
    start_date, end_date = get_date_range(
        date_range,
    )

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
        setattr(
            expense,
            field,
            value,
        )

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
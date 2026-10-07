from calendar import monthrange
from datetime import date, datetime, timezone
from enum import Enum

from beanie import PydanticObjectId

from expense_tracker.features.income.model import Income
from expense_tracker.features.income.schema import (
    IncomeCreate,
    IncomeUpdate,
)


class IncomeDateRange(str, Enum):
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
    date_range: IncomeDateRange,
) -> tuple[date | None, date | None]:
    today = date.today()

    if date_range == IncomeDateRange.ALL:
        return None, None

    if date_range == IncomeDateRange.THIS_MONTH:
        start_date = today.replace(day=1)

        return start_date, today

    if date_range == IncomeDateRange.LAST_6_MONTHS:
        start_date = subtract_months(
            today,
            6,
        )

        return start_date, today

    if date_range == IncomeDateRange.LAST_YEAR:
        start_date = subtract_months(
            today,
            12,
        )

        return start_date, today

    return None, None


async def create_income(
    user_id: PydanticObjectId,
    data: IncomeCreate,
) -> Income:
    income = Income(
    user_id=user_id,
    amount=data.amount,
    source=data.source,
    payment_mode=data.payment_mode,
    note=data.note,
    income_date=data.income_date,
)

    await income.insert()

    return income


async def get_incomes(
    user_id: PydanticObjectId,
    date_range: IncomeDateRange = IncomeDateRange.ALL,
) -> list[Income]:
    start_date, end_date = get_date_range(
        date_range,
    )

    query = Income.find(
        Income.user_id == user_id,
    )

    if start_date is not None:
        query = query.find(
            Income.income_date >= start_date,
        )

    if end_date is not None:
        query = query.find(
            Income.income_date <= end_date,
        )

    return await query.sort(
        -Income.income_date,
    ).to_list()


async def get_income_by_id(
    income_id: PydanticObjectId,
    user_id: PydanticObjectId,
) -> Income | None:
    return await Income.find_one(
        Income.id == income_id,
        Income.user_id == user_id,
    )


async def update_income(
    income: Income,
    data: IncomeUpdate,
) -> Income:
    update_data = data.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():
        setattr(
            income,
            field,
            value,
        )

    income.updated_at = datetime.now(timezone.utc)

    await income.save()

    return income


async def delete_income(
    income: Income,
) -> None:
    await income.delete()
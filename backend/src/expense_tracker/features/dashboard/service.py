
from datetime import datetime, timezone
from decimal import Decimal

from beanie import PydanticObjectId

from expense_tracker.features.expense.model import Expense
from expense_tracker.features.income.model import Income


def _field_value(value):
    """Support both Enum values from models and strings from demo data."""
    return getattr(value, "value", value)


def build_dashboard_data(
    incomes: list,
    expenses: list,
) -> dict:
    today = datetime.now(timezone.utc).date()
    start_of_month = today.replace(day=1)

    this_month_incomes = [
        income
        for income in incomes
        if start_of_month <= income["income_date"] if isinstance(income, dict)
    ] if False else [
        income for income in incomes
        if start_of_month <= (
            income["income_date"] if isinstance(income, dict)
            else income.income_date
        ) <= today
    ]

    this_month_expenses = [
        expense for expense in expenses
        if start_of_month <= (
            expense["expense_date"] if isinstance(expense, dict)
            else expense.expense_date
        ) <= today
    ]

    income_this_month = sum(
        (
            income["amount"] if isinstance(income, dict) else income.amount
            for income in this_month_incomes
        ),
        Decimal("0"),
    )

    expenses_this_month = sum(
        (
            expense["amount"] if isinstance(expense, dict) else expense.amount
            for expense in this_month_expenses
        ),
        Decimal("0"),
    )

    category_totals: dict[str, Decimal] = {}
    for expense in this_month_expenses:
        category = _field_value(
            expense["category"] if isinstance(expense, dict)
            else expense.category
        )
        amount = expense["amount"] if isinstance(expense, dict) else expense.amount
        category_totals[category] = category_totals.get(
            category, Decimal("0")
        ) + amount

    categories = [
        {
            "category": category,
            "amount": amount,
            "percentage": round(
                float(amount / expenses_this_month * 100)
                if expenses_this_month > 0 else 0.0,
                2,
            ),
        }
        for category, amount in category_totals.items()
    ]
    categories.sort(key=lambda item: item["amount"], reverse=True)

    payment_mode_totals: dict[str, Decimal] = {}
    for expense in this_month_expenses:
        payment_mode = _field_value(
            expense["payment_mode"] if isinstance(expense, dict)
            else expense.payment_mode
        )
        amount = expense["amount"] if isinstance(expense, dict) else expense.amount
        payment_mode_totals[payment_mode] = (
            payment_mode_totals.get(payment_mode, Decimal("0")) + amount
        )

    payment_modes = [
        {
            "payment_mode": payment_mode,
            "amount": amount,
            "percentage": round(
                float(amount / expenses_this_month * 100)
                if expenses_this_month > 0 else 0.0,
                2,
            ),
        }
        for payment_mode, amount in payment_mode_totals.items()
    ]
    payment_modes.sort(key=lambda item: item["amount"], reverse=True)

    return {
        "summary": {
            "income_this_month": income_this_month,
            "expenses_this_month": expenses_this_month,
            "balance_this_month": income_this_month - expenses_this_month,
        },
        "categories": categories,
        "payment_modes": payment_modes,
    }


async def get_dashboard_data(
    user_id: PydanticObjectId,
):
    incomes = await Income.find(
        Income.user_id == user_id,
    ).to_list()

    expenses = await Expense.find(
        Expense.user_id == user_id,
    ).to_list()

    return build_dashboard_data(incomes, expenses)


def get_demo_dashboard_data(session: dict) -> dict:
    return build_dashboard_data(
        session["incomes"],
        session["expenses"],
    )

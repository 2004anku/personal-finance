from datetime import datetime, timezone
from decimal import Decimal

from beanie import PydanticObjectId

from expense_tracker.features.expense.model import Expense
from expense_tracker.features.income.model import Income


async def get_dashboard_data(
    user_id: PydanticObjectId,
):
    today = datetime.now(timezone.utc).date()
    start_of_month = today.replace(day=1)

    # --------------------------------------------------
    # Fetch user's transactions
    # --------------------------------------------------

    incomes = await Income.find(
        Income.user_id == user_id,
    ).to_list()

    expenses = await Expense.find(
        Expense.user_id == user_id,
    ).to_list()

    # --------------------------------------------------
    # Filter current month
    # --------------------------------------------------

    this_month_incomes = [
        income
        for income in incomes
        if start_of_month <= income.income_date <= today
    ]

    this_month_expenses = [
        expense
        for expense in expenses
        if start_of_month <= expense.expense_date <= today
    ]

    # --------------------------------------------------
    # Monthly totals
    # --------------------------------------------------

    income_this_month = sum(
        (
            income.amount
            for income in this_month_incomes
        ),
        Decimal("0"),
    )

    expenses_this_month = sum(
        (
            expense.amount
            for expense in this_month_expenses
        ),
        Decimal("0"),
    )

    balance_this_month = (
        income_this_month - expenses_this_month
    )

    # --------------------------------------------------
    # Spending by category
    # --------------------------------------------------

    category_totals: dict[str, Decimal] = {}

    for expense in this_month_expenses:
        category = expense.category.value

        category_totals[category] = (
            category_totals.get(
                category,
                Decimal("0"),
            )
            + expense.amount
        )

    categories = []

    for category, amount in category_totals.items():
        percentage = (
            float(
                (amount / expenses_this_month) * 100
            )
            if expenses_this_month > 0
            else 0.0
        )

        categories.append(
            {
                "category": category,
                "amount": amount,
                "percentage": round(
                    percentage,
                    2,
                ),
            }
        )

    categories.sort(
        key=lambda item: item["amount"],
        reverse=True,
    )

    # --------------------------------------------------
    # Spending by payment mode
    # --------------------------------------------------

    payment_mode_totals: dict[str, Decimal] = {}

    for expense in this_month_expenses:
        payment_mode = expense.payment_mode.value

        payment_mode_totals[payment_mode] = (
            payment_mode_totals.get(
                payment_mode,
                Decimal("0"),
            )
            + expense.amount
        )

    payment_modes = []

    for payment_mode, amount in payment_mode_totals.items():
        percentage = (
            float(
                (amount / expenses_this_month) * 100
            )
            if expenses_this_month > 0
            else 0.0
        )

        payment_modes.append(
            {
                "payment_mode": payment_mode,
                "amount": amount,
                "percentage": round(
                    percentage,
                    2,
                ),
            }
        )

    payment_modes.sort(
        key=lambda item: item["amount"],
        reverse=True,
    )

    # --------------------------------------------------
    # Dashboard response
    # --------------------------------------------------

    return {
        "summary": {
            "income_this_month": income_this_month,
            "expenses_this_month": expenses_this_month,
            "balance_this_month": balance_this_month,
        },
        "categories": categories,
        "payment_modes": payment_modes,
    }
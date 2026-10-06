from datetime import datetime, timezone
from decimal import Decimal

from beanie import PydanticObjectId

from expense_tracker.features.expense.model import Expense
from expense_tracker.features.income.model import Income


async def get_dashboard_data(user_id: PydanticObjectId):
    today = datetime.now(timezone.utc).date()
    start_of_month = today.replace(day=1)

    # ---------------------------------------------------------
    # Fetch expenses and incomes
    # ---------------------------------------------------------

    expenses = await Expense.find(
        Expense.user_id == user_id
    ).to_list()

    incomes = await Income.find(
        Income.user_id == user_id
    ).to_list()

    # ---------------------------------------------------------
    # Total income
    # ---------------------------------------------------------

    total_income = sum(
        (income.amount for income in incomes),
        Decimal("0"),
    )

    # ---------------------------------------------------------
    # Total expenses
    # ---------------------------------------------------------

    total_expenses = sum(
        (expense.amount for expense in expenses),
        Decimal("0"),
    )

    # ---------------------------------------------------------
    # Balance
    # ---------------------------------------------------------

    balance = total_income - total_expenses

    # ---------------------------------------------------------
    # This month
    # ---------------------------------------------------------

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

    income_this_month = sum(
        (income.amount for income in this_month_incomes),
        Decimal("0"),
    )

    expenses_this_month = sum(
        (expense.amount for expense in this_month_expenses),
        Decimal("0"),
    )

    # ---------------------------------------------------------
    # Today
    # ---------------------------------------------------------

    today_incomes = [
        income
        for income in incomes
        if income.income_date == today
    ]

    today_expenses = [
        expense
        for expense in expenses
        if expense.expense_date == today
    ]

    income_today = sum(
        (income.amount for income in today_incomes),
        Decimal("0"),
    )

    expenses_today = sum(
        (expense.amount for expense in today_expenses),
        Decimal("0"),
    )

    # ---------------------------------------------------------
    # Average daily expense
    # ---------------------------------------------------------

    days_elapsed = today.day

    average_daily_expense = (
        expenses_this_month / Decimal(days_elapsed)
        if days_elapsed > 0
        else Decimal("0")
    )

    # ---------------------------------------------------------
    # Category totals
    # ---------------------------------------------------------

    category_totals: dict[str, Decimal] = {}

    for expense in expenses:
        category = expense.category.value

        category_totals[category] = (
            category_totals.get(category, Decimal("0"))
            + expense.amount
        )

    categories = []

    for category, amount in category_totals.items():
        percentage = (
            float((amount / total_expenses) * 100)
            if total_expenses > 0
            else 0.0
        )

        categories.append(
            {
                "category": category,
                "amount": amount,
                "percentage": round(percentage, 2),
            }
        )

    categories.sort(
        key=lambda item: item["amount"],
        reverse=True,
    )

    # ---------------------------------------------------------
    # Payment mode totals
    # ---------------------------------------------------------

    payment_mode_totals: dict[str, Decimal] = {}

    for expense in expenses:
        payment_mode = expense.payment_mode.value

        payment_mode_totals[payment_mode] = (
            payment_mode_totals.get(payment_mode, Decimal("0"))
            + expense.amount
        )

    payment_modes = []

    for payment_mode, amount in payment_mode_totals.items():
        percentage = (
            float((amount / total_expenses) * 100)
            if total_expenses > 0
            else 0.0
        )

        payment_modes.append(
            {
                "payment_mode": payment_mode,
                "amount": amount,
                "percentage": round(percentage, 2),
            }
        )

    payment_modes.sort(
        key=lambda item: item["amount"],
        reverse=True,
    )

    # ---------------------------------------------------------
    # Response
    # ---------------------------------------------------------

    return {
        "summary": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "balance": balance,
            "income_this_month": income_this_month,
            "expenses_this_month": expenses_this_month,
            "income_today": income_today,
            "expenses_today": expenses_today,
            "average_daily_expense": average_daily_expense,
        },
        "categories": categories,
        "payment_modes": payment_modes,
    }
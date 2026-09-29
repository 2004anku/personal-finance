from datetime import date, datetime, timezone
from decimal import Decimal

from beanie import PydanticObjectId

from expense_tracker.features.expense.model import Expense


async def get_dashboard_data(user_id: PydanticObjectId):
    today = datetime.now(timezone.utc).date()

    start_of_month = today.replace(day=1)

    expenses = await Expense.find(
        Expense.user_id == user_id
    ).to_list()

    total_expenses = sum(
        (expense.amount for expense in expenses),
        Decimal("0"),
    )

    this_month_expenses = [
        expense
        for expense in expenses
        if expense.expense_date >= start_of_month
        and expense.expense_date <= today
    ]

    today_expenses = [
        expense
        for expense in expenses
        if expense.expense_date == today
    ]

    this_month = sum(
        (expense.amount for expense in this_month_expenses),
        Decimal("0"),
    )

    today_total = sum(
        (expense.amount for expense in today_expenses),
        Decimal("0"),
    )

    days_elapsed = today.day

    average_daily = (
        this_month / Decimal(days_elapsed)
        if days_elapsed > 0
        else Decimal("0")
    )

    # Category totals
    category_totals: dict[str, Decimal] = {}

    for expense in expenses:
        category = expense.category.value

        category_totals[category] = (
            category_totals.get(category, Decimal("0"))
            + expense.amount
        )

    # Payment mode totals
    payment_mode_totals: dict[str, Decimal] = {}

    for expense in expenses:
        payment_mode = expense.payment_mode.value

        payment_mode_totals[payment_mode] = (
            payment_mode_totals.get(payment_mode, Decimal("0"))
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

    categories.sort(
        key=lambda item: item["amount"],
        reverse=True,
    )

    payment_modes.sort(
        key=lambda item: item["amount"],
        reverse=True,
    )

    return {
        "summary": {
            "total_expenses": total_expenses,
            "this_month": this_month,
            "today": today_total,
            "average_daily": average_daily,
        },
        "categories": categories,
        "payment_modes": payment_modes,
    }
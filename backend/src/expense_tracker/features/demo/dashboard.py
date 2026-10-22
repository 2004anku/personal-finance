
from datetime import date, datetime, timezone
from decimal import Decimal


def _transaction_date(value) -> date:
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return date.fromisoformat(str(value)[:10])


def get_demo_dashboard_data(session: dict) -> dict:
    today = datetime.now(timezone.utc).date()
    start_of_month = today.replace(day=1)

    incomes = [
        item for item in session["incomes"]
        if start_of_month
        <= _transaction_date(item["income_date"])
        <= today
    ]

    expenses = [
        item for item in session["expenses"]
        if start_of_month
        <= _transaction_date(item["expense_date"])
        <= today
    ]

    income_total = sum(
        (Decimal(str(item["amount"])) for item in incomes),
        Decimal("0"),
    )
    expense_total = sum(
        (Decimal(str(item["amount"])) for item in expenses),
        Decimal("0"),
    )

    def aggregate(field: str) -> list[dict]:
        totals: dict[str, Decimal] = {}

        for item in expenses:
            value = item[field]
            key = value.value if hasattr(value, "value") else str(value)
            totals[key] = totals.get(key, Decimal("0")) + Decimal(
                str(item["amount"])
            )

        result = [
            {
                field: key,
                "amount": amount,
                "percentage": round(
                    float(amount / expense_total * 100), 2
                ) if expense_total else 0.0,
            }
            for key, amount in totals.items()
        ]
        result.sort(key=lambda item: item["amount"], reverse=True)
        return result

    return {
        "summary": {
            "income_this_month": income_total,
            "expenses_this_month": expense_total,
            "balance_this_month": income_total - expense_total,
        },
        "categories": aggregate("category"),
        "payment_modes": [
            {
                "payment_mode": item["payment_mode"],
                "amount": item["amount"],
                "percentage": item["percentage"],
            }
            for item in aggregate("payment_mode")
        ],
    }

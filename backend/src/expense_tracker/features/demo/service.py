
from datetime import date, datetime, timezone
from decimal import Decimal
from uuid import uuid4
from beanie import PydanticObjectId

def _now() -> datetime:
    return datetime.now(timezone.utc)


def seed_demo_data(session: dict) -> None:
    """Populate a newly created demo session with example transactions."""
    today = date.today()

    session["expenses"] = [
        {
"id": str(PydanticObjectId()),
            "amount": Decimal("1850.00"),
            "category": "Food",
            "note": "Groceries",
            "payment_mode": "UPI",
            "expense_date": today,
            "created_at": _now(),
            "updated_at": _now(),
        },
        {
            "id": str(PydanticObjectId()),
            "amount": Decimal("1200.00"),
            "category": "Travel",
            "note": "Monthly travel",
            "payment_mode": "Cash",
            "expense_date": today,
            "created_at": _now(),
            "updated_at": _now(),
        },
    ]

    session["incomes"] = [
        {
            "id": str(PydanticObjectId()),
            "amount": Decimal("45000.00"),
            "source": "Salary",
            "payment_mode": "UPI",
            "note": "Monthly salary",
            "income_date": today,
            "created_at": _now(),
            "updated_at": _now(),
        },
        {
            "id": str(PydanticObjectId()),
            "amount": Decimal("8500.00"),
            "source": "Freelance",
            "payment_mode": "UPI",
            "note": "Freelance project",
            "income_date": today,
            "created_at": _now(),
            "updated_at": _now(),
        },
    ]


def list_transactions(session: dict, kind: str) -> list[dict]:
    if kind not in ("expenses", "incomes"):
        raise ValueError("Unsupported transaction type")

    return list(session[kind])


def create_transaction(
    session: dict,
    kind: str,
    data: dict,
) -> dict:
    if kind not in ("expenses", "incomes"):
        raise ValueError("Unsupported transaction type")

    now = _now()
    transaction = {
        **data,
        "id": str(PydanticObjectId()),
        "created_at": now,
        "updated_at": now,
    }

    session[kind].append(transaction)
    return transaction


def update_transaction(
    session: dict,
    kind: str,
    transaction_id: str,
    data: dict,
) -> dict | None:
    if kind not in ("expenses", "incomes"):
        raise ValueError("Unsupported transaction type")

    for index, transaction in enumerate(session[kind]):
        if transaction["id"] == transaction_id:
            updated = {
                **transaction,
                **data,
                "id": transaction_id,
                "created_at": transaction["created_at"],
                "updated_at": _now(),
            }
            session[kind][index] = updated
            return updated

    return None


def delete_transaction(
    session: dict,
    kind: str,
    transaction_id: str,
) -> bool:
    if kind not in ("expenses", "incomes"):
        raise ValueError("Unsupported transaction type")

    for index, transaction in enumerate(session[kind]):
        if transaction["id"] == transaction_id:
            del session[kind][index]
            return True

    return False

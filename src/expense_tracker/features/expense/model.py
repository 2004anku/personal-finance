from datetime import date, datetime, timezone
from decimal import Decimal
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class ExpenseCategory(str, Enum):
    FOOD = "Food"
    TRAVEL = "Travel"
    SHOPPING = "Shopping"
    BILLS = "Bills"
    ENTERTAINMENT = "Entertainment"
    HEALTH = "Health"
    EDUCATION = "Education"
    OTHER = "Other"


class PaymentMode(str, Enum):
    CASH = "Cash"
    UPI = "UPI"
    CARD = "Card"
    BANK_TRANSFER = "Bank Transfer"
    OTHER = "Other"


class Expense(Document):
    user_id: PydanticObjectId

    amount: Decimal = Field(gt=0)

    category: ExpenseCategory

    note: str | None = Field(
        default=None,
        max_length=500,
    )

    payment_mode: PaymentMode

    expense_date: date

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    class Settings:
        name = "expenses"

        indexes = [
            IndexModel(
                [
                    ("user_id", ASCENDING),
                    ("expense_date", ASCENDING),
                ]
            )
        ]
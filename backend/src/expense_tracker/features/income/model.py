from datetime import date, datetime, timezone
from decimal import Decimal
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class IncomeSource(str, Enum):
    SALARY = "Salary"
    FREELANCE = "Freelance"
    BUSINESS = "Business"
    BONUS = "Bonus"
    GIFT = "Gift"
    OTHER = "Other"


class IncomePaymentMode(str, Enum):
    UPI = "UPI"
    CASH = "Cash"


class Income(Document):
    user_id: PydanticObjectId

    amount: Decimal = Field(gt=0)

    source: IncomeSource

    payment_mode: IncomePaymentMode

    note: str | None = Field(
        default=None,
        max_length=500,
    )

    income_date: date

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    class Settings:
        name = "incomes"

        indexes = [
            IndexModel(
                [
                    ("user_id", ASCENDING),
                    ("income_date", ASCENDING),
                ]
            )
        ]
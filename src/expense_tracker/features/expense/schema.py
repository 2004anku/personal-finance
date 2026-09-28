from datetime import date, datetime
from decimal import Decimal

from beanie import PydanticObjectId
from pydantic import BaseModel, ConfigDict, Field

from expense_tracker.features.expense.model import (
    ExpenseCategory,
    PaymentMode,
)


class ExpenseCreate(BaseModel):
    amount: Decimal = Field(
        gt=0,
        decimal_places=2,
    )
    category: ExpenseCategory
    note: str | None = Field(
        default=None,
        max_length=500,
    )
    payment_mode: PaymentMode
    expense_date: date


class ExpenseUpdate(BaseModel):
    amount: Decimal | None = Field(
        default=None,
        gt=0,
        decimal_places=2,
    )
    category: ExpenseCategory | None = None
    note: str | None = Field(
        default=None,
        max_length=500,
    )
    payment_mode: PaymentMode | None = None
    expense_date: date | None = None


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: PydanticObjectId
    amount: Decimal
    category: ExpenseCategory
    note: str | None
    payment_mode: PaymentMode
    expense_date: date
    created_at: datetime
    updated_at: datetime
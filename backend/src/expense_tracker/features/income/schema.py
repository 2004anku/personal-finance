from datetime import date, datetime
from decimal import Decimal

from beanie import PydanticObjectId
from pydantic import BaseModel, ConfigDict, Field

from expense_tracker.features.income.model import IncomeSource


class IncomeCreate(BaseModel):
    amount: Decimal = Field(
        gt=0,
        decimal_places=2,
    )
    source: IncomeSource
    note: str | None = Field(
        default=None,
        max_length=500,
    )
    income_date: date


class IncomeUpdate(BaseModel):
    amount: Decimal | None = Field(
        default=None,
        gt=0,
        decimal_places=2,
    )
    source: IncomeSource | None = None
    note: str | None = Field(
        default=None,
        max_length=500,
    )
    income_date: date | None = None


class IncomeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: PydanticObjectId
    amount: Decimal
    source: IncomeSource
    note: str | None
    income_date: date
    created_at: datetime
    updated_at: datetime
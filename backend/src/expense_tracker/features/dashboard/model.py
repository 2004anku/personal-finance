from decimal import Decimal

from pydantic import BaseModel


class CategorySummary(BaseModel):
    category: str
    amount: Decimal
    percentage: float


class PaymentModeSummary(BaseModel):
    payment_mode: str
    amount: Decimal
    percentage: float


class DashboardSummary(BaseModel):
    income_this_month: Decimal
    expenses_this_month: Decimal
    balance_this_month: Decimal


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    categories: list[CategorySummary]
    payment_modes: list[PaymentModeSummary]
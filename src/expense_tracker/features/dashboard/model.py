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
    total_expenses: Decimal
    this_month: Decimal
    today: Decimal
    average_daily: Decimal


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    categories: list[CategorySummary]
    payment_modes: list[PaymentModeSummary]
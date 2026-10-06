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
    total_income: Decimal
    total_expenses: Decimal
    balance: Decimal

    income_this_month: Decimal
    expenses_this_month: Decimal

    income_today: Decimal
    expenses_today: Decimal

    average_daily_expense: Decimal


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    categories: list[CategorySummary]
    payment_modes: list[PaymentModeSummary]
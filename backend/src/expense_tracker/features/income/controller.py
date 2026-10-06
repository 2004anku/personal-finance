import logging

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from expense_tracker.features.income.schema import (
    IncomeCreate,
    IncomeResponse,
    IncomeUpdate,
)
from expense_tracker.features.income.service import (
    IncomeDateRange,
    create_income,
    delete_income,
    get_income_by_id,
    get_incomes,
    update_income,
)


logger = logging.getLogger(__name__)


async def create_income_controller(
    user_id: PydanticObjectId,
    data: IncomeCreate,
) -> IncomeResponse:
    try:
        income = await create_income(
            user_id=user_id,
            data=data,
        )

        return IncomeResponse.model_validate(income)

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Error creating income for user_id=%s",
            user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create income",
        )


async def get_incomes_controller(
    user_id: PydanticObjectId,
    date_range: IncomeDateRange = IncomeDateRange.ALL,
) -> list[IncomeResponse]:
    try:
        incomes = await get_incomes(
            user_id=user_id,
            date_range=date_range,
        )

        return [
            IncomeResponse.model_validate(income)
            for income in incomes
        ]

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Error fetching incomes for user_id=%s",
            user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch incomes",
        )


async def get_income_controller(
    income_id: PydanticObjectId,
    user_id: PydanticObjectId,
) -> IncomeResponse:
    try:
        income = await get_income_by_id(
            income_id=income_id,
            user_id=user_id,
        )

        if not income:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Income not found",
            )

        return IncomeResponse.model_validate(income)

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Error fetching income_id=%s for user_id=%s",
            income_id,
            user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch income",
        )


async def update_income_controller(
    income_id: PydanticObjectId,
    user_id: PydanticObjectId,
    data: IncomeUpdate,
) -> IncomeResponse:
    try:
        income = await get_income_by_id(
            income_id=income_id,
            user_id=user_id,
        )

        if not income:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Income not found",
            )

        updated_income = await update_income(
            income=income,
            data=data,
        )

        return IncomeResponse.model_validate(updated_income)

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Error updating income_id=%s for user_id=%s",
            income_id,
            user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update income",
        )


async def delete_income_controller(
    income_id: PydanticObjectId,
    user_id: PydanticObjectId,
) -> None:
    try:
        income = await get_income_by_id(
            income_id=income_id,
            user_id=user_id,
        )

        if not income:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Income not found",
            )

        await delete_income(income)

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Error deleting income_id=%s for user_id=%s",
            income_id,
            user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete income",
        )
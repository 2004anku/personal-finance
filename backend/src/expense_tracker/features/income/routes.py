
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Response, status

from expense_tracker.dependencies import get_request_context
from expense_tracker.features.demo.service import (
    create_transaction,
    delete_transaction,
    list_transactions,
    update_transaction,
)
from expense_tracker.features.income.controller import (
    create_income_controller,
    delete_income_controller,
    get_income_controller,
    get_incomes_controller,
    update_income_controller,
)
from expense_tracker.features.income.schema import (
    IncomeCreate,
    IncomeResponse,
    IncomeUpdate,
)
from expense_tracker.features.income.service import (
    IncomeDateRange,
    get_date_range,
)


router = APIRouter(
    prefix="/incomes",
    tags=["Incomes"],
)


@router.post(
    "",
    response_model=IncomeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_income(
    data: IncomeCreate,
    context: dict = Depends(get_request_context),
) -> IncomeResponse:
    if context["type"] == "demo":
        transaction = create_transaction(
            context["session"],
            "incomes",
            data.model_dump(mode="python"),
        )
        return IncomeResponse.model_validate(transaction)

    return await create_income_controller(
        user_id=context["user"].id,
        data=data,
    )


@router.get(
    "",
    response_model=list[IncomeResponse],
)
async def get_incomes(
    date_range: IncomeDateRange = IncomeDateRange.ALL,
    context: dict = Depends(get_request_context),
) -> list[IncomeResponse]:
    if context["type"] == "demo":
        transactions = list_transactions(
            context["session"],
            "incomes",
        )

        start_date, end_date = get_date_range(date_range)

        if start_date is not None:
            transactions = [
                item for item in transactions
                if item["income_date"] >= start_date
            ]

        if end_date is not None:
            transactions = [
                item for item in transactions
                if item["income_date"] <= end_date
            ]

        transactions.sort(
            key=lambda item: item["income_date"],
            reverse=True,
        )

        return [
            IncomeResponse.model_validate(item)
            for item in transactions
        ]

    return await get_incomes_controller(
        user_id=context["user"].id,
        date_range=date_range,
    )


@router.get(
    "/{income_id}",
    response_model=IncomeResponse,
)
async def get_income(
    income_id: PydanticObjectId,
    context: dict = Depends(get_request_context),
) -> IncomeResponse:
    if context["type"] == "demo":
        transaction = next(
            (
                item for item in list_transactions(
                    context["session"],
                    "incomes",
                )
                if item["id"] == str(income_id)
            ),
            None,
        )

        if transaction is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Income not found",
            )

        return IncomeResponse.model_validate(transaction)

    return await get_income_controller(
        income_id=income_id,
        user_id=context["user"].id,
    )


@router.put(
    "/{income_id}",
    response_model=IncomeResponse,
)
async def update_income(
    income_id: PydanticObjectId,
    data: IncomeUpdate,
    context: dict = Depends(get_request_context),
) -> IncomeResponse:
    if context["type"] == "demo":
        transaction = update_transaction(
            context["session"],
            "incomes",
            str(income_id),
            data.model_dump(exclude_unset=True, mode="python"),
        )

        if transaction is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Income not found",
            )

        return IncomeResponse.model_validate(transaction)

    return await update_income_controller(
        income_id=income_id,
        user_id=context["user"].id,
        data=data,
    )


@router.delete(
    "/{income_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_income(
    income_id: PydanticObjectId,
    context: dict = Depends(get_request_context),
) -> Response:
    if context["type"] == "demo":
        deleted = delete_transaction(
            context["session"],
            "incomes",
            str(income_id),
        )

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Income not found",
            )
    else:
        await delete_income_controller(
            income_id=income_id,
            user_id=context["user"].id,
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)

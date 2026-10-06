from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from expense_tracker.database.connection import (
    client,
    connect_to_database,
)
from expense_tracker.features.auth.routes import router as auth_router
from expense_tracker.features.expense.routes import router as expense_router
from expense_tracker.features.dashboard.routes import router as dashboard_router
from expense_tracker.features.income.routes import router as income_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_database()

    yield

    await client.close()
    print("MongoDB connection closed")


app = FastAPI(
    title="Expense Tracker",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(expense_router)
app.include_router(dashboard_router)
app.include_router(income_router)

@app.get("/")
async def root():
    return {"message": "Expense Tracker API is running"}
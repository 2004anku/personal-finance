from beanie import init_beanie
from bson.codec_options import TypeRegistry
from bson.decimal128 import DecimalDecoder, DecimalEncoder
from pymongo import AsyncMongoClient

from expense_tracker.core.config import settings
from expense_tracker.features.user.model import User
from expense_tracker.features.expense.model import Expense


type_registry = TypeRegistry(
    [
        DecimalEncoder(),
        DecimalDecoder(),
    ]
)

client = AsyncMongoClient(
    settings.mongodb_url,
    type_registry=type_registry,
)

database = client[settings.database_name]


async def connect_to_database():
    await client.admin.command("ping")

    await init_beanie(
        database=database,
        document_models=[
            User,
            Expense,
        ],
    )

    print("MongoDB and Beanie initialized successfully")
from datetime import datetime, timezone

from beanie import Document
from pydantic import EmailStr, Field
from pymongo import ASCENDING, IndexModel


class User(Document):
    name: str
    email: EmailStr
    password_hash: str

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    class Settings:
        name = "users"

        indexes = [
            IndexModel(
                [("email", ASCENDING)],
                unique=True,
            )
        ]
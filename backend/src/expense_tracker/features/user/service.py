from datetime import datetime, timezone

from beanie import PydanticObjectId

from expense_tracker.features.user.model import User


async def get_user_by_email(email: str) -> User | None:
    return await User.find_one(User.email == email)


async def get_user_by_id(user_id: PydanticObjectId) -> User | None:
    return await User.get(user_id)


async def create_user(
    name: str,
    email: str,
    password_hash: str,
) -> User:
    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
    )

    await user.insert()

    return user


async def update_user_profile(
    user: User,
    name: str,
    email: str,
) -> User:
    user.name = name
    user.email = email
    user.updated_at = datetime.now(timezone.utc)

    await user.save()

    return user
from beanie import PydanticObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError

from expense_tracker.core.security import decode_access_token
from expense_tracker.features.user.model import User
from expense_tracker.features.demo.session import get_demo_session

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except InvalidTokenError:
        raise credentials_exception

    user_id = payload.get("sub")

    if not user_id:
        raise credentials_exception

    try:
        user_id = PydanticObjectId(user_id)
    except Exception:
        raise credentials_exception

    user = await User.get(user_id)

    if not user:
        raise credentials_exception

    return user





async def get_request_context(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
) -> dict:
    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except InvalidTokenError:
        # Preserve the existing authentication error behavior.
        await get_current_user(credentials)
        raise

    if payload.get("type") == "demo":
        session_id, session = get_demo_session(token)
        return {
            "type": "demo",
            "session_id": session_id,
            "session": session,
        }

    user = await get_current_user(credentials)
    return {
        "type": "user",
        "user": user,
    }

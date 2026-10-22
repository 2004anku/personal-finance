
from datetime import datetime, timedelta, timezone
from threading import RLock
from uuid import uuid4
from expense_tracker.features.demo.service import seed_demo_data
import jwt
from fastapi import HTTPException, status

from expense_tracker.core.config import settings


DEMO_SESSION_HOURS = 4

# Temporary, process-local storage. Demo data is never persisted to MongoDB.
_demo_sessions: dict[str, dict] = {}
_demo_sessions_lock = RLock()



def create_demo_session() -> dict:
    """Create an isolated demo session and return its access token."""
    now = datetime.now(timezone.utc)
    session_id = str(uuid4())
    expires_at = now + timedelta(hours=DEMO_SESSION_HOURS)

    payload = {
        "sub": f"demo:{session_id}",
        "type": "demo",
        "iat": now,
        "exp": expires_at,
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

    session = {
        "expires_at": expires_at,
        "expenses": [],
        "incomes": [],
    }

    seed_demo_data(session)

    with _demo_sessions_lock:
        _demo_sessions[session_id] = session

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_at": expires_at.isoformat(),
    }



def get_demo_session(token: str) -> tuple[str, dict]:
    """Validate a demo token and return its active temporary session."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired demo session.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != "demo":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This is not a demo session.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    subject = payload.get("sub", "")
    if not isinstance(subject, str) or not subject.startswith("demo:"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid demo session.",
        )

    session_id = subject.removeprefix("demo:")

    with _demo_sessions_lock:
        session = _demo_sessions.get(session_id)

        if session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Demo session expired or no longer available. Start a new demo.",
            )

        if session["expires_at"] <= datetime.now(timezone.utc):
            _demo_sessions.pop(session_id, None)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Demo session expired. Start a new demo.",
            )

        return session_id, session

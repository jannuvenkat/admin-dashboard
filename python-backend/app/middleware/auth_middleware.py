from typing import Optional
from fastapi import Header, HTTPException, Depends
from app.core.security import decode_access_token
from app.database.connection import execute_one

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Not authorized, no token provided"
        )

    token = authorization.split(" ")[1]
    try:
        decoded = decode_access_token(token)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Not authorized, token verification failed"
        )

    user_id = decoded.get("id")
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Not authorized, token verification failed"
        )

    user = await execute_one(
        "SELECT id, name, email, role, created_at FROM users WHERE id = %s",
        (user_id,)
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authorized, user not found"
        )

    return user

async def get_current_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Admin access required"
        )
    return current_user

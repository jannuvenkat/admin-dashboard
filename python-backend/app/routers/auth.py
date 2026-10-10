from fastapi import APIRouter, Depends, Body
from app.services.auth_service import auth_service
from app.middleware.auth_middleware import get_current_user
from app.schemas.auth import LoginRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
async def login(credentials: LoginRequest):
    data = await auth_service.login(credentials.email, credentials.password)
    return {
        "success": True,
        "data": data
    }

@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "data": {
            "id": current_user["id"],
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user["role"],
            "created_at": current_user.get("created_at")
        }
    }

@router.post("/logout")
async def logout():
    return {
        "success": True,
        "message": "Logged out successfully"
    }

from fastapi import HTTPException
from app.models.user_model import user_model
from app.core.security import verify_password, create_access_token

class AuthService:
    @staticmethod
    async def login(email: str, password: str) -> dict:
        if not email or not password:
            raise HTTPException(status_code=400, detail="Please provide email and password")

        user = await user_model.find_by_email(email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not verify_password(password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if user["role"] != "admin":
            raise HTTPException(
                status_code=403,
                detail="Access denied: Administrator privileges required to access the dashboard"
            )

        token = create_access_token(user["id"], user["role"])

        return {
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "created_at": user["created_at"]
            },
            "token": token
        }

auth_service = AuthService()

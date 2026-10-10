import math
from fastapi import HTTPException
from app.models.user_model import user_model
from app.core.security import hash_password

class UserService:
    @staticmethod
    async def get_all_users(params: dict) -> dict:
        try:
            page = int(params.get("page") or 1)
        except (ValueError, TypeError):
            page = 1
        try:
            limit = int(params.get("limit") or 10)
        except (ValueError, TypeError):
            limit = 10

        search = params.get("search") or ""
        role = params.get("role") or ""
        sort_by = params.get("sortBy") or "created_at"
        sort_order = params.get("sortOrder") or "DESC"

        users = await user_model.find_users(
            page=page,
            limit=limit,
            search=search,
            role=role,
            sort_by=sort_by,
            sort_order=sort_order
        )
        total = await user_model.count_users(search=search, role=role)
        total_pages = math.ceil(total / limit) if total > 0 else 1

        return {
            "users": users,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": total_pages
            }
        }

    @staticmethod
    async def get_user_by_id(user_id: int) -> dict:
        user = await user_model.find_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    @staticmethod
    async def create_user(data: dict) -> dict:
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "user")

        if not name or not email or not password:
            raise HTTPException(status_code=400, detail="Name, email, and password are required")

        existing = await user_model.find_by_email(email)
        if existing:
            raise HTTPException(status_code=400, detail="Email is already registered")

        hashed_pwd = hash_password(password)
        new_user_id = await user_model.create_user(
            name=name,
            email=email,
            password=hashed_pwd,
            role=role or "user"
        )
        return await user_model.find_by_id(new_user_id)

    @staticmethod
    async def update_user(user_id: int, update_data: dict) -> dict:
        user = await user_model.find_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        email = update_data.get("email")
        if email and email != user["email"]:
            existing = await user_model.find_by_email(email)
            if existing and existing["id"] != int(user_id):
                raise HTTPException(status_code=400, detail="Email is already in use by another user")

        fields_to_update = dict(update_data)
        pwd = fields_to_update.get("password")
        if pwd and str(pwd).strip() != "":
            fields_to_update["password"] = hash_password(str(pwd))
        else:
            fields_to_update.pop("password", None)

        await user_model.update_user(user_id, fields_to_update)
        return await user_model.find_by_id(user_id)

    @staticmethod
    async def delete_user(user_id: int) -> bool:
        user = await user_model.find_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.get("role") == "admin":
            admins = await user_model.find_users(role="admin", limit=10)
            if len(admins) <= 1:
                raise HTTPException(status_code=400, detail="Cannot delete the sole administrator account")

        return await user_model.delete_user(user_id)

user_service = UserService()

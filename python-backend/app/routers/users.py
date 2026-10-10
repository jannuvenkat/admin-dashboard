from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from app.services.user_service import user_service
from app.middleware.auth_middleware import get_current_admin_user
from app.schemas.users import UserCreateRequest, UserUpdateRequest

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("")
@router.get("/")
async def get_users(
    page: int = Query(1),
    limit: int = Query(10),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    sortBy: Optional[str] = Query("created_at"),
    sortOrder: Optional[str] = Query("DESC"),
    _admin: dict = Depends(get_current_admin_user)
):
    params = {
        "page": page,
        "limit": limit,
        "search": search,
        "role": role,
        "sortBy": sortBy,
        "sortOrder": sortOrder
    }
    result = await user_service.get_all_users(params)
    return {
        "success": True,
        "data": result["users"],
        "pagination": result["pagination"]
    }

@router.get("/{user_id}")
async def get_user_by_id(
    user_id: int,
    _admin: dict = Depends(get_current_admin_user)
):
    user = await user_service.get_user_by_id(user_id)
    return {
        "success": True,
        "data": user
    }

@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreateRequest,
    _admin: dict = Depends(get_current_admin_user)
):
    new_user = await user_service.create_user(body.model_dump())
    return {
        "success": True,
        "data": new_user
    }

@router.put("/{user_id}")
async def update_user(
    user_id: int,
    body: UserUpdateRequest,
    _admin: dict = Depends(get_current_admin_user)
):
    updated_user = await user_service.update_user(user_id, body.model_dump(exclude_unset=True))
    return {
        "success": True,
        "data": updated_user
    }

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    _admin: dict = Depends(get_current_admin_user)
):
    await user_service.delete_user(user_id)
    return {
        "success": True,
        "message": "User deleted successfully"
    }

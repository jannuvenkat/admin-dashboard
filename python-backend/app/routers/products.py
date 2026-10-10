from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from app.services.product_service import product_service
from app.middleware.auth_middleware import get_current_admin_user
from app.schemas.products import ProductCreateRequest, ProductUpdateRequest

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("")
@router.get("/")
async def get_products(
    page: int = Query(1),
    limit: int = Query(10),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    stock: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    sortBy: Optional[str] = Query("created_at"),
    sortOrder: Optional[str] = Query("DESC"),
    _admin: dict = Depends(get_current_admin_user)
):
    params = {
        "page": page,
        "limit": limit,
        "search": search,
        "category": category,
        "stock": stock,
        "status": status_filter,
        "sortBy": sortBy,
        "sortOrder": sortOrder
    }
    result = await product_service.get_all_products(params)
    return {
        "success": True,
        "data": result["products"],
        "pagination": result["pagination"]
    }

# MUST be declared BEFORE /{product_id} so /categories is not matched as an ID
@router.get("/categories")
async def get_categories(_admin: dict = Depends(get_current_admin_user)):
    categories = await product_service.get_categories()
    return {
        "success": True,
        "data": categories
    }

@router.get("/{product_id}")
async def get_product_by_id(
    product_id: int,
    _admin: dict = Depends(get_current_admin_user)
):
    product = await product_service.get_product_by_id(product_id)
    return {
        "success": True,
        "data": product
    }

@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_product(
    body: ProductCreateRequest,
    _admin: dict = Depends(get_current_admin_user)
):
    new_product = await product_service.create_product(body.model_dump())
    return {
        "success": True,
        "data": new_product
    }

@router.put("/{product_id}")
async def update_product(
    product_id: int,
    body: ProductUpdateRequest,
    _admin: dict = Depends(get_current_admin_user)
):
    updated_product = await product_service.update_product(product_id, body.model_dump(exclude_unset=True))
    return {
        "success": True,
        "data": updated_product
    }

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    _admin: dict = Depends(get_current_admin_user)
):
    await product_service.delete_product(product_id)
    return {
        "success": True,
        "message": "Product deleted successfully"
    }

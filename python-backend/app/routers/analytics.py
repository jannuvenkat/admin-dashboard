from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.services.analytics_service import analytics_service
from app.middleware.auth_middleware import get_current_admin_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/revenue")
async def get_revenue_analytics(
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    _admin: dict = Depends(get_current_admin_user)
):
    params = {"startDate": startDate, "endDate": endDate}
    data = await analytics_service.get_revenue_analytics(params)
    return {
        "success": True,
        "data": data
    }

@router.get("/users")
async def get_user_analytics(
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    _admin: dict = Depends(get_current_admin_user)
):
    params = {"startDate": startDate, "endDate": endDate}
    data = await analytics_service.get_user_analytics(params)
    return {
        "success": True,
        "data": data
    }

@router.get("/orders")
async def get_order_analytics(
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    _admin: dict = Depends(get_current_admin_user)
):
    params = {"startDate": startDate, "endDate": endDate}
    data = await analytics_service.get_order_analytics(params)
    return {
        "success": True,
        "data": data
    }

@router.get("/products")
async def get_product_analytics(
    _admin: dict = Depends(get_current_admin_user)
):
    data = await analytics_service.get_product_analytics()
    return {
        "success": True,
        "data": data
    }

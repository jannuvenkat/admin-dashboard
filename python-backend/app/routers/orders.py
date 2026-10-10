from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, HTTPException
from fastapi.responses import JSONResponse
from app.services.order_service import order_service
from app.middleware.auth_middleware import get_current_admin_user
from app.schemas.orders import OrderStatusUpdateRequest

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("")
@router.get("/")
async def get_orders(
    page: int = Query(1),
    limit: int = Query(10),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    sortBy: Optional[str] = Query("created_at"),
    sortOrder: Optional[str] = Query("DESC"),
    _admin: dict = Depends(get_current_admin_user)
):
    params = {
        "page": page,
        "limit": limit,
        "search": search,
        "status": status_filter,
        "startDate": startDate,
        "endDate": endDate,
        "sortBy": sortBy,
        "sortOrder": sortOrder
    }
    result = await order_service.get_all_orders(params)
    return {
        "success": True,
        "data": result["orders"],
        "pagination": result["pagination"]
    }

# MUST be declared BEFORE /{order_id} so /export is not matched as an ID
@router.get("/export")
async def export_orders(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    sortBy: Optional[str] = Query("created_at"),
    sortOrder: Optional[str] = Query("DESC"),
    _admin: dict = Depends(get_current_admin_user)
):
    params = {
        "search": search,
        "status": status_filter,
        "startDate": startDate,
        "endDate": endDate,
        "sortBy": sortBy,
        "sortOrder": sortOrder
    }
    export_result = await order_service.export_orders(params)

    if export_result["count"] == 0 or not export_result["stream"]:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": "No orders found for the selected filters."
            }
        )

    content = export_result["stream"].getvalue()
    filename = export_result["filename"]

    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Access-Control-Expose-Headers": "Content-Disposition"
    }

    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )

@router.get("/{order_id}")
async def get_order_by_id(
    order_id: int,
    _admin: dict = Depends(get_current_admin_user)
):
    order = await order_service.get_order_by_id(order_id)
    return {
        "success": True,
        "data": order
    }

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: int,
    body: OrderStatusUpdateRequest,
    _admin: dict = Depends(get_current_admin_user)
):
    updated_order = await order_service.update_order_status(order_id, body.status)
    return {
        "success": True,
        "data": updated_order
    }

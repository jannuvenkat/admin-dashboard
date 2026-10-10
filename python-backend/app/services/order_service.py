from datetime import datetime
import math
from fastapi import HTTPException
from app.models.order_model import order_model
from app.services.excel_service import excel_service

class OrderService:
    @staticmethod
    async def get_all_orders(params: dict) -> dict:
        try:
            page = int(params.get("page") or 1)
        except (ValueError, TypeError):
            page = 1
        try:
            limit = int(params.get("limit") or 10)
        except (ValueError, TypeError):
            limit = 10

        search = params.get("search") or ""
        status = params.get("status") or ""
        start_date = params.get("startDate") or ""
        end_date = params.get("endDate") or ""
        sort_by = params.get("sortBy") or "created_at"
        sort_order = params.get("sortOrder") or "DESC"

        orders = await order_model.find_orders(
            page=page,
            limit=limit,
            search=search,
            status=status,
            start_date=start_date,
            end_date=end_date,
            sort_by=sort_by,
            sort_order=sort_order
        )
        total = await order_model.count_orders(
            search=search,
            status=status,
            start_date=start_date,
            end_date=end_date
        )
        total_pages = math.ceil(total / limit) if total > 0 else 1

        return {
            "orders": orders,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": total_pages
            }
        }

    @staticmethod
    async def get_order_by_id(order_id: int) -> dict:
        order = await order_model.find_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        items = await order_model.find_order_items(order_id)
        order["items"] = items
        return order

    @staticmethod
    async def update_order_status(order_id: int, status: str) -> dict:
        valid_statuses = ["pending", "processing", "completed", "cancelled"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )

        order = await order_model.find_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        await order_model.update_status(order_id, status)
        return await order_model.find_by_id(order_id)

    @staticmethod
    async def export_orders(params: dict) -> dict:
        search = params.get("search") or ""
        status = params.get("status") or ""
        start_date = params.get("startDate") or ""
        end_date = params.get("endDate") or ""
        sort_by = params.get("sortBy") or "created_at"
        sort_order = params.get("sortOrder") or "DESC"

        orders = await order_model.find_all_orders_for_export(
            search=search,
            status=status,
            start_date=start_date,
            end_date=end_date,
            sort_by=sort_by,
            sort_order=sort_order
        )

        if not orders:
            return {"count": 0, "stream": None, "filename": None}

        stream = excel_service.generate_orders_workbook(orders, params)
        current_date = datetime.now().strftime("%Y-%m-%d")
        filename = f"orders_{current_date}.xlsx"

        return {
            "count": len(orders),
            "stream": stream,
            "filename": filename
        }

order_service = OrderService()

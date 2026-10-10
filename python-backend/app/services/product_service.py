import math
from fastapi import HTTPException
from app.models.product_model import product_model
from app.models.category_model import category_model

class ProductService:
    @staticmethod
    async def get_all_products(params: dict) -> dict:
        try:
            page = int(params.get("page") or 1)
        except (ValueError, TypeError):
            page = 1
        try:
            limit = int(params.get("limit") or 10)
        except (ValueError, TypeError):
            limit = 10

        search = params.get("search") or ""
        category = params.get("category") or ""
        stock = params.get("stock") or ""
        status = params.get("status") or ""
        sort_by = params.get("sortBy") or "created_at"
        sort_order = params.get("sortOrder") or "DESC"

        products = await product_model.find_products(
            page=page,
            limit=limit,
            search=search,
            category=category,
            stock=stock,
            status=status,
            sort_by=sort_by,
            sort_order=sort_order
        )
        total = await product_model.count_products(
            search=search,
            category=category,
            stock=stock,
            status=status
        )
        total_pages = math.ceil(total / limit) if total > 0 else 1

        return {
            "products": products,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": total_pages
            }
        }

    @staticmethod
    async def get_product_by_id(product_id: int) -> dict:
        product = await product_model.find_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

    @staticmethod
    async def create_product(product_data: dict) -> dict:
        name = product_data.get("name")
        category_id = product_data.get("category_id")
        price = product_data.get("price")
        stock = product_data.get("stock", 0)
        status = product_data.get("status", "active")

        if not name or category_id is None or price is None:
            raise HTTPException(status_code=400, detail="Product name, category ID, and price are required")

        cat = await category_model.find_by_id(int(category_id))
        if not cat:
            raise HTTPException(status_code=400, detail="Invalid category ID")

        try:
            price_val = float(price)
            stock_val = int(stock) if stock is not None else 0
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Invalid price or stock value")

        new_id = await product_model.create_product(
            name=name,
            category_id=int(category_id),
            price=price_val,
            stock=stock_val,
            status=status or "active"
        )
        return await product_model.find_by_id(new_id)

    @staticmethod
    async def update_product(product_id: int, update_data: dict) -> dict:
        product = await product_model.find_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if update_data.get("category_id") is not None:
            cat = await category_model.find_by_id(int(update_data["category_id"]))
            if not cat:
                raise HTTPException(status_code=400, detail="Invalid category ID")

        await product_model.update_product(product_id, update_data)
        return await product_model.find_by_id(product_id)

    @staticmethod
    async def delete_product(product_id: int) -> bool:
        product = await product_model.find_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        return await product_model.delete_product(product_id)

    @staticmethod
    async def get_categories() -> list[dict]:
        return await category_model.get_all()

product_service = ProductService()

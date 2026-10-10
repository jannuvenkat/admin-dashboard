from app.database.connection import execute_query, execute_one, execute_insert, execute_update

class ProductModel:
    @staticmethod
    async def find_products(
        page: int = 1,
        limit: int = 10,
        search: str = "",
        category: str = "",
        stock: str = "",
        status: str = "",
        sort_by: str = "created_at",
        sort_order: str = "DESC"
    ) -> list[dict]:
        offset = (page - 1) * limit
        params = []
        where_clause = "WHERE 1=1"

        if search:
            where_clause += " AND (p.name LIKE %s OR c.name LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])

        if category:
            where_clause += " AND p.category_id = %s"
            params.append(int(category))

        if status and status in ["active", "inactive"]:
            where_clause += " AND p.status = %s"
            params.append(status)

        if stock:
            if stock == "low":
                where_clause += " AND p.stock > 0 AND p.stock <= 10"
            elif stock == "out":
                where_clause += " AND p.stock = 0"
            elif stock == "in":
                where_clause += " AND p.stock > 10"

        allowed_sort_fields = {
            "id": "p.id",
            "name": "p.name",
            "price": "p.price",
            "stock": "p.stock",
            "status": "p.status",
            "category": "c.name",
            "created_at": "p.created_at"
        }

        sort_column = allowed_sort_fields.get(sort_by, "p.created_at")
        safe_sort_order = "ASC" if sort_order.upper() == "ASC" else "DESC"

        query = f"""
            SELECT 
                p.id, 
                p.name, 
                p.category_id, 
                c.name AS category_name, 
                p.price, 
                p.stock, 
                p.status, 
                p.created_at, 
                p.updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            {where_clause}
            ORDER BY {sort_column} {safe_sort_order}
            LIMIT %s OFFSET %s
        """
        params.extend([int(limit), int(offset)])
        return await execute_query(query, tuple(params))

    @staticmethod
    async def count_products(
        search: str = "",
        category: str = "",
        stock: str = "",
        status: str = ""
    ) -> int:
        params = []
        where_clause = "WHERE 1=1"

        if search:
            where_clause += " AND (p.name LIKE %s OR c.name LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])

        if category:
            where_clause += " AND p.category_id = %s"
            params.append(int(category))

        if status and status in ["active", "inactive"]:
            where_clause += " AND p.status = %s"
            params.append(status)

        if stock:
            if stock == "low":
                where_clause += " AND p.stock > 0 AND p.stock <= 10"
            elif stock == "out":
                where_clause += " AND p.stock = 0"
            elif stock == "in":
                where_clause += " AND p.stock > 10"

        query = f"""
            SELECT COUNT(*) AS total
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            {where_clause}
        """
        result = await execute_one(query, tuple(params))
        return int(result["total"]) if result else 0

    @staticmethod
    async def find_by_id(product_id: int) -> dict | None:
        query = """
            SELECT 
                p.id, 
                p.name, 
                p.category_id, 
                c.name AS category_name, 
                p.price, 
                p.stock, 
                p.status, 
                p.created_at, 
                p.updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = %s
        """
        return await execute_one(query, (product_id,))

    @staticmethod
    async def create_product(name: str, category_id: int, price: float, stock: int = 0, status: str = "active") -> int:
        query = """
            INSERT INTO products (name, category_id, price, stock, status)
            VALUES (%s, %s, %s, %s, %s)
        """
        return await execute_insert(query, (name, category_id, price, stock, status))

    @staticmethod
    async def update_product(product_id: int, fields: dict) -> bool:
        updates = []
        params = []

        if fields.get("name") is not None:
            updates.append("name = %s")
            params.append(fields["name"])

        if fields.get("category_id") is not None:
            updates.append("category_id = %s")
            params.append(int(fields["category_id"]))

        if fields.get("price") is not None:
            updates.append("price = %s")
            params.append(float(fields["price"]))

        if fields.get("stock") is not None:
            updates.append("stock = %s")
            params.append(int(fields["stock"]))

        if fields.get("status") is not None and fields["status"] in ["active", "inactive"]:
            updates.append("status = %s")
            params.append(fields["status"])

        if not updates:
            return False

        params.append(product_id)
        query = f"UPDATE products SET {', '.join(updates)} WHERE id = %s"
        affected = await execute_update(query, tuple(params))
        return affected > 0

    @staticmethod
    async def delete_product(product_id: int) -> bool:
        query = "DELETE FROM products WHERE id = %s"
        affected = await execute_update(query, (product_id,))
        return affected > 0

product_model = ProductModel()

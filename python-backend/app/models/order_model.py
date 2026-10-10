from app.database.connection import execute_query, execute_one, execute_update

class OrderModel:
    @staticmethod
    async def find_orders(
        page: int = 1,
        limit: int = 10,
        search: str = "",
        status: str = "",
        start_date: str = "",
        end_date: str = "",
        sort_by: str = "created_at",
        sort_order: str = "DESC"
    ) -> list[dict]:
        offset = (page - 1) * limit
        params = []
        where_clause = "WHERE 1=1"

        if search:
            where_clause += " AND (u.name LIKE %s OR u.email LIKE %s OR o.id = %s)"
            is_digit = search.isdigit()
            order_id_search = int(search) if is_digit else -1
            params.extend([f"%{search}%", f"%{search}%", order_id_search])

        if status and status in ["pending", "processing", "completed", "cancelled"]:
            where_clause += " AND o.status = %s"
            params.append(status)

        if start_date:
            where_clause += " AND DATE(o.created_at) >= %s"
            params.append(start_date)

        if end_date:
            where_clause += " AND DATE(o.created_at) <= %s"
            params.append(end_date)

        allowed_sort_fields = {
            "id": "o.id",
            "total_amount": "o.total_amount",
            "status": "o.status",
            "created_at": "o.created_at",
            "customer": "u.name"
        }

        sort_column = allowed_sort_fields.get(sort_by, "o.created_at")
        safe_sort_order = "ASC" if sort_order.upper() == "ASC" else "DESC"

        query = f"""
            SELECT 
                o.id, 
                o.user_id, 
                u.name AS customer_name, 
                u.email AS customer_email,
                o.total_amount, 
                o.status, 
                o.created_at, 
                o.updated_at,
                p.payment_method,
                p.payment_status
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN payments p ON p.order_id = o.id
            {where_clause}
            ORDER BY {sort_column} {safe_sort_order}
            LIMIT %s OFFSET %s
        """
        params.extend([int(limit), int(offset)])
        return await execute_query(query, tuple(params))

    @staticmethod
    async def count_orders(
        search: str = "",
        status: str = "",
        start_date: str = "",
        end_date: str = ""
    ) -> int:
        params = []
        where_clause = "WHERE 1=1"

        if search:
            where_clause += " AND (u.name LIKE %s OR u.email LIKE %s OR o.id = %s)"
            is_digit = search.isdigit()
            order_id_search = int(search) if is_digit else -1
            params.extend([f"%{search}%", f"%{search}%", order_id_search])

        if status and status in ["pending", "processing", "completed", "cancelled"]:
            where_clause += " AND o.status = %s"
            params.append(status)

        if start_date:
            where_clause += " AND DATE(o.created_at) >= %s"
            params.append(start_date)

        if end_date:
            where_clause += " AND DATE(o.created_at) <= %s"
            params.append(end_date)

        query = f"""
            SELECT COUNT(*) AS total
            FROM orders o
            JOIN users u ON o.user_id = u.id
            {where_clause}
        """
        result = await execute_one(query, tuple(params))
        return int(result["total"]) if result else 0

    @staticmethod
    async def find_by_id(order_id: int) -> dict | None:
        query = """
            SELECT 
                o.id, 
                o.user_id, 
                u.name AS customer_name, 
                u.email AS customer_email,
                o.total_amount, 
                o.status, 
                o.created_at, 
                o.updated_at,
                p.payment_method,
                p.payment_status,
                p.created_at AS payment_date
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN payments p ON p.order_id = o.id
            WHERE o.id = %s
        """
        return await execute_one(query, (order_id,))

    @staticmethod
    async def find_order_items(order_id: int) -> list[dict]:
        query = """
            SELECT 
                oi.id, 
                oi.order_id, 
                oi.product_id, 
                p.name AS product_name, 
                c.name AS category_name,
                oi.quantity, 
                oi.price, 
                (oi.quantity * oi.price) AS subtotal
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE oi.order_id = %s
        """
        return await execute_query(query, (order_id,))

    @staticmethod
    async def update_status(order_id: int, status: str) -> bool:
        query = "UPDATE orders SET status = %s WHERE id = %s"
        affected = await execute_update(query, (status, order_id))

        if status == "completed":
            await execute_update(
                "UPDATE payments SET payment_status = 'completed' WHERE order_id = %s AND payment_status = 'pending'",
                (order_id,)
            )
        elif status == "cancelled":
            await execute_update(
                "UPDATE payments SET payment_status = 'failed' WHERE order_id = %s AND payment_status = 'pending'",
                (order_id,)
            )

        return affected > 0

    @staticmethod
    async def find_all_orders_for_export(
        search: str = "",
        status: str = "",
        start_date: str = "",
        end_date: str = "",
        sort_by: str = "created_at",
        sort_order: str = "DESC"
    ) -> list[dict]:
        params = []
        where_clause = "WHERE 1=1"

        if search:
            where_clause += " AND (u.name LIKE %s OR u.email LIKE %s OR o.id = %s)"
            is_digit = search.isdigit()
            order_id_search = int(search) if is_digit else -1
            params.extend([f"%{search}%", f"%{search}%", order_id_search])

        if status and status in ["pending", "processing", "completed", "cancelled"]:
            where_clause += " AND o.status = %s"
            params.append(status)

        if start_date:
            where_clause += " AND DATE(o.created_at) >= %s"
            params.append(start_date)

        if end_date:
            where_clause += " AND DATE(o.created_at) <= %s"
            params.append(end_date)

        allowed_sort_fields = {
            "id": "o.id",
            "total_amount": "o.total_amount",
            "status": "o.status",
            "created_at": "o.created_at",
            "customer": "u.name"
        }

        sort_column = allowed_sort_fields.get(sort_by, "o.created_at")
        safe_sort_order = "ASC" if sort_order.upper() == "ASC" else "DESC"

        query = f"""
            SELECT 
                o.id, 
                u.name AS customer_name, 
                u.email AS customer_email,
                o.total_amount, 
                o.status, 
                p.payment_method,
                p.payment_status,
                o.created_at
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN payments p ON p.order_id = o.id
            {where_clause}
            ORDER BY {sort_column} {safe_sort_order}
        """
        return await execute_query(query, tuple(params))

order_model = OrderModel()

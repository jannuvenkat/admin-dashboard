from app.database.connection import execute_query, execute_one, execute_insert, execute_update

class UserModel:
    @staticmethod
    async def find_by_email(email: str) -> dict | None:
        query = "SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = %s"
        return await execute_one(query, (email,))

    @staticmethod
    async def find_by_id(user_id: int) -> dict | None:
        query = "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = %s"
        return await execute_one(query, (user_id,))

    @staticmethod
    async def find_users(page: int = 1, limit: int = 10, search: str = "", role: str = "", sort_by: str = "created_at", sort_order: str = "DESC") -> list[dict]:
        offset = (page - 1) * limit
        params = []
        where_clause = "WHERE 1=1"

        if search:
            where_clause += " AND (name LIKE %s OR email LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])

        if role and role in ["admin", "user"]:
            where_clause += " AND role = %s"
            params.append(role)

        allowed_sort_fields = ["id", "name", "email", "role", "created_at"]
        safe_sort_by = sort_by if sort_by in allowed_sort_fields else "created_at"
        safe_sort_order = "ASC" if sort_order.upper() == "ASC" else "DESC"

        query = f"""
            SELECT id, name, email, role, created_at, updated_at
            FROM users
            {where_clause}
            ORDER BY {safe_sort_by} {safe_sort_order}
            LIMIT %s OFFSET %s
        """
        params.extend([int(limit), int(offset)])
        return await execute_query(query, tuple(params))

    @staticmethod
    async def count_users(search: str = "", role: str = "") -> int:
        params = []
        where_clause = "WHERE 1=1"

        if search:
            where_clause += " AND (name LIKE %s OR email LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])

        if role and role in ["admin", "user"]:
            where_clause += " AND role = %s"
            params.append(role)

        query = f"SELECT COUNT(*) AS total FROM users {where_clause}"
        result = await execute_one(query, tuple(params))
        return int(result["total"]) if result else 0

    @staticmethod
    async def create_user(name: str, email: str, password: str, role: str = "user") -> int:
        query = "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)"
        return await execute_insert(query, (name, email, password, role))

    @staticmethod
    async def update_user(user_id: int, fields: dict) -> bool:
        updates = []
        params = []

        if fields.get("name") is not None:
            updates.append("name = %s")
            params.append(fields["name"])

        if fields.get("email") is not None:
            updates.append("email = %s")
            params.append(fields["email"])

        if fields.get("password") is not None and str(fields["password"]).strip() != "":
            updates.append("password = %s")
            params.append(fields["password"])

        if fields.get("role") is not None and fields["role"] in ["admin", "user"]:
            updates.append("role = %s")
            params.append(fields["role"])

        if not updates:
            return False

        params.append(user_id)
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
        affected = await execute_update(query, tuple(params))
        return affected > 0

    @staticmethod
    async def delete_user(user_id: int) -> bool:
        query = "DELETE FROM users WHERE id = %s"
        affected = await execute_update(query, (user_id,))
        return affected > 0

user_model = UserModel()

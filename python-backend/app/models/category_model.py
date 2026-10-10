from app.database.connection import execute_query, execute_one, execute_insert

class CategoryModel:
    @staticmethod
    async def get_all() -> list[dict]:
        query = "SELECT id, name, created_at FROM categories ORDER BY name ASC"
        return await execute_query(query)

    @staticmethod
    async def find_by_id(category_id: int) -> dict | None:
        query = "SELECT id, name, created_at FROM categories WHERE id = %s"
        return await execute_one(query, (category_id,))

    @staticmethod
    async def create(name: str) -> int:
        query = "INSERT INTO categories (name) VALUES (%s)"
        return await execute_insert(query, (name,))

category_model = CategoryModel()

import asyncio
import os
import ssl
from datetime import datetime, date
from decimal import Decimal
import aiomysql
from app.core.config import settings

pool: aiomysql.Pool | None = None

async def init_db_pool():
    global pool
    if pool is None:
        ssl_ctx = None
        if settings.DB_SSL:
            ssl_ctx = ssl.create_default_context()
            if settings.DB_SSL_CA and os.path.exists(settings.DB_SSL_CA):
                ssl_ctx.load_verify_locations(settings.DB_SSL_CA)
                ssl_ctx.verify_mode = ssl.CERT_REQUIRED
            else:
                ssl_ctx.check_hostname = False
                ssl_ctx.verify_mode = ssl.CERT_NONE

        pool = await aiomysql.create_pool(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            db=settings.DB_NAME,
            minsize=1,
            maxsize=10,
            autocommit=True,
            charset="utf8mb4",
            ssl=ssl_ctx
        )
        print(f"[Database] Connected successfully to MySQL database: {settings.DB_NAME} at {settings.DB_HOST}:{settings.DB_PORT} (SSL: {'Enabled' if ssl_ctx else 'Disabled'})")

async def close_db_pool():
    global pool
    if pool is not None:
        pool.close()
        await pool.wait_closed()
        pool = None
        print("[Database] MySQL connection pool closed")

def serialize_value(val):
    if isinstance(val, Decimal):
        return int(val) if val % 1 == 0 else float(val)
    elif isinstance(val, datetime):
        return val.strftime("%Y-%m-%d %H:%M:%S")
    elif isinstance(val, date):
        return val.strftime("%Y-%m-%d")
    return val

def serialize_row(row: dict | None) -> dict | None:
    if row is None:
        return None
    return {k: serialize_value(v) for k, v in row.items()}

def serialize_rows(rows: list[dict]) -> list[dict]:
    return [serialize_row(r) for r in rows]

async def execute_query(sql: str, params: tuple | list = None) -> list[dict]:
    global pool
    if pool is None:
        await init_db_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            if params:
                await cur.execute(sql, params)
            else:
                await cur.execute(sql)
            rows = await cur.fetchall()
            return serialize_rows(rows)

async def execute_one(sql: str, params: tuple | list = None) -> dict | None:
    global pool
    if pool is None:
        await init_db_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            if params:
                await cur.execute(sql, params)
            else:
                await cur.execute(sql)
            row = await cur.fetchone()
            return serialize_row(row)

async def execute_insert(sql: str, params: tuple | list = None) -> int:
    global pool
    if pool is None:
        await init_db_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            if params:
                await cur.execute(sql, params)
            else:
                await cur.execute(sql)
            return cur.lastrowid

async def execute_update(sql: str, params: tuple | list = None) -> int:
    global pool
    if pool is None:
        await init_db_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            if params:
                await cur.execute(sql, params)
            else:
                await cur.execute(sql)
            return cur.rowcount

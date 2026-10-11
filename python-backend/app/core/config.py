import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    PORT: int = int(os.getenv("PORT", "5000"))

    # Support full connection string (DATABASE_URL / MYSQL_URL) if provided on Render
    db_url = os.getenv("DATABASE_URL") or os.getenv("MYSQL_URL")
    if db_url:
        parsed = urlparse(db_url)
        DB_HOST: str = parsed.hostname or "localhost"
        DB_PORT: int = parsed.port or 3306
        DB_USER: str = parsed.username or "root"
        DB_PASSWORD: str = parsed.password or ""
        DB_NAME: str = (parsed.path or "/admin_dashboard").lstrip("/")
        query_params = parse_qs(parsed.query)
        ssl_param = query_params.get("ssl-mode", [None])[0] or query_params.get("ssl", [None])[0]
        DB_SSL_MODE: str = os.getenv("DB_SSL_MODE") or ssl_param or ("REQUIRED" if "aivencloud.com" in DB_HOST else "DISABLED")
        DB_SSL: bool = (
            bool(ssl_param)
            or "aivencloud.com" in DB_HOST
            or (DB_PORT != 3306 and DB_HOST not in ("localhost", "127.0.0.1"))
            or os.getenv("DB_SSL", "").lower() in ("true", "1", "yes", "required")
        )
    else:
        DB_HOST: str = os.getenv("DB_HOST", "localhost")
        DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
        DB_USER: str = os.getenv("DB_USER", "root")
        DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
        DB_NAME: str = os.getenv("DB_NAME", "admin_dashboard")
        DB_SSL_MODE: str = os.getenv("DB_SSL_MODE", "").upper()
        DB_SSL: bool = (
            os.getenv("DB_SSL", "").lower() in ("true", "1", "yes")
            or DB_SSL_MODE in ("REQUIRED", "VERIFY-CA", "VERIFY-FULL")
            or "aivencloud.com" in DB_HOST
            or (DB_PORT != 3306 and DB_HOST not in ("localhost", "127.0.0.1"))
        )

    DB_SSL_CA: str = os.getenv("DB_SSL_CA", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_jwt_key_admin_dashboard_2026_secure")
    JWT_EXPIRES_IN: str = os.getenv("JWT_EXPIRES_IN", "7d")
    NODE_ENV: str = os.getenv("NODE_ENV", "development")

settings = Settings()

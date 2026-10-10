import os
from pathlib import Path
from dotenv import load_dotenv

# Locate and load .env file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    PORT: int = int(os.getenv("PORT", "5000"))
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "admin_dashboard")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_jwt_key_admin_dashboard_2026_secure")
    JWT_EXPIRES_IN: str = os.getenv("JWT_EXPIRES_IN", "7d")
    NODE_ENV: str = os.getenv("NODE_ENV", "development")

settings = Settings()

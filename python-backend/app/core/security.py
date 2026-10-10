import datetime
import jwt
import bcrypt
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        if not plain_password or not hashed_password:
            return False
        # Normalize hash encoding
        hash_bytes = hashed_password.encode('utf-8')
        # In case of $2a$ format with strict bcrypt, allow both $2a$ and $2b$
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), hash_bytes)
        except ValueError:
            if hash_bytes.startswith(b"$2a$"):
                compat_hash = b"$2b$" + hash_bytes[4:]
                return bcrypt.checkpw(plain_password.encode('utf-8'), compat_hash)
            raise
    except Exception:
        return False

def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(plain_password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(user_id: int, role: str) -> str:
    # 7 days expiration matching Node.js
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    payload = {
        "id": user_id,
        "role": role,
        "exp": expire
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])

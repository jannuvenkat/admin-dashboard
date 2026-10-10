from typing import Optional
from pydantic import BaseModel

class UserCreateRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "user"

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None

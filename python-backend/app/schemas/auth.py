from typing import Optional
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: str
    password: str

class UserData(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: Optional[str] = None

class LoginResponseData(BaseModel):
    user: UserData
    token: str

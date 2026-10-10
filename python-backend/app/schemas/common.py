from typing import Any, Optional
from pydantic import BaseModel

class PaginationSchema(BaseModel):
    page: int
    limit: int
    total: int
    totalPages: int

class SuccessResponse(BaseModel):
    success: bool = True
    data: Optional[Any] = None
    message: Optional[str] = None

class PaginatedResponse(BaseModel):
    success: bool = True
    data: list[Any]
    pagination: PaginationSchema

class ErrorResponse(BaseModel):
    success: bool = False
    message: str

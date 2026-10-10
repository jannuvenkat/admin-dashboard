from typing import Optional, Union
from pydantic import BaseModel

class ProductCreateRequest(BaseModel):
    name: str
    category_id: int
    price: Union[float, int]
    stock: Optional[int] = 0
    status: Optional[str] = "active"

class ProductUpdateRequest(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[Union[float, int]] = None
    stock: Optional[int] = None
    status: Optional[str] = None

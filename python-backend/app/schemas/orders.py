from pydantic import BaseModel

class OrderStatusUpdateRequest(BaseModel):
    status: str

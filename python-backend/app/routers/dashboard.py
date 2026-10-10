from fastapi import APIRouter, Depends
from app.services.dashboard_service import dashboard_service
from app.middleware.auth_middleware import get_current_admin_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_stats(_admin: dict = Depends(get_current_admin_user)):
    stats = await dashboard_service.get_stats()
    return {
        "success": True,
        "data": stats
    }

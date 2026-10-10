from contextlib import asynccontextmanager
from datetime import datetime, timezone
import logging
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import uvicorn

from app.core.config import settings
from app.database.connection import init_db_pool, close_db_pool

# Router imports
from app.routers import auth, dashboard, users, products, orders, analytics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("===============================================")
    print("  Admin Analytics Dashboard Python API Server")
    print(f"  Listening on http://localhost:{settings.PORT}")
    print("===============================================")
    await init_db_pool()
    yield
    await close_db_pool()

app = FastAPI(
    title="Admin Analytics Dashboard API",
    description="Python FastAPI backend migrated from Node.js Express",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration matching Node.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# Centralized Error Handlers matching Express envelope: { "success": false, "message": "..." }
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    missing_fields = [
        err["loc"][-1] for err in errors
        if err.get("type") in ["missing", "value_error.missing"] and err.get("loc")
    ]
    if missing_fields:
        message = f"Missing required field(s): {', '.join(str(f) for f in missing_fields)}"
    else:
        first_err = errors[0] if errors else {}
        field = first_err.get("loc", ["request"])[-1]
        msg = first_err.get("msg", "Invalid input")
        message = f"{field}: {msg}"

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "message": message
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"[Error] {request.method} {request.url.path} - {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": str(exc) or "Internal Server Error"
        }
    )

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    now_iso = datetime.now(timezone.utc).isoformat()
    logger.info(f"[{now_iso}] {request.method} {request.url.path}")
    response = await call_next(request)
    return response

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "success": True,
        "message": "Admin Dashboard API is running",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Mount API Routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)

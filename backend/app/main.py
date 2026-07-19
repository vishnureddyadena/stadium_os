import asyncio
import logging
import time
from typing import Dict, List
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.db.seeds import seed_db
from app.api.auth.router import router as auth_router
from app.api.ai.router import router as ai_router
from app.api.live.router import router as live_router
from app.api.modules.router import router as modules_router
from app.services.simulator import run_telemetry_simulator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stadium_os_main")

# Auto create database schema and seed data
Base.metadata.create_all(bind=engine)
db = SessionLocal()
try:
    seed_db(db)
finally:
    db.close()

# Lifetime management (alternative to startup/shutdown events)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Launch background simulation worker
    sim_task = asyncio.create_task(run_telemetry_simulator())
    logger.info("Background telemetry simulator launched.")
    yield
    # Shutdown: Cancel background simulation worker
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        logger.info("Background telemetry simulator stopped.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="One Intelligent Platform for Every FIFA 2026 Stadium Experience.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory rate-limiter: client IP -> requests timestamps
RATE_LIMIT_STORE: Dict[str, List[float]] = {}
RATE_LIMIT_MAX_REQUESTS = 30 # Max 30 attempts
RATE_LIMIT_WINDOW_SECONDS = 60 # per minute

@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    # Only rate limit auth endpoints to prevent brute-forcing
    if request.url.path.startswith(f"{settings.API_V1_STR}/auth/"):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        timestamps = RATE_LIMIT_STORE.get(client_ip, [])
        # Evict timestamps older than sliding window
        timestamps = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW_SECONDS]
        
        if len(timestamps) >= RATE_LIMIT_MAX_REQUESTS:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many verification requests. IP rate-limited. Retry shortly."}
            )
            
        timestamps.append(now)
        RATE_LIMIT_STORE[client_ip] = timestamps
        
    return await call_next(request)

# Include routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(live_router, prefix=settings.API_V1_STR)
app.include_router(modules_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "platform": settings.PROJECT_NAME,
        "location": "Dallas Stadium (FIFA 2026 Venue)",
        "docs": "/docs"
    }

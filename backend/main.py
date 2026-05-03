"""
Главный файл FastAPI приложения для учета затрат на выращивание вешенок
"""
import os
import signal
import sys
import logging
import json
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from database import init_db, close_db
from routers import users, categories, plans, transactions, stats

# Настройка логирования
class JSONFormatter(logging.Formatter):
    """JSON форматтер для продакшен логов"""
    def format(self, record):
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)

# Настройка логирования в зависимости от DEBUG
if os.getenv("DEBUG", "false").lower() != "true":
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    logging.basicConfig(
        level=logging.INFO,
        handlers=[handler],
        force=True
    )
else:
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        force=True
    )

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения"""
    # Запуск
    logger.info("🚀 Starting Mushroom Bot API...")
    
    # Инициализация базы данных
    try:
        await init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise
    
    yield
    
    # Завершение работы
    logger.info("🛑 Shutting down application...")
    try:
        await close_db()
        logger.info("✅ Database connections closed")
    except Exception as e:
        logger.error(f"❌ Error closing database: {e}")


# Создание FastAPI приложения
app = FastAPI(
    title="Mushroom Bot API",
    description="API для учета затрат и аналитики при выращивании вешенок",
    version=os.getenv("APP_VERSION", "1.0.0"),
    lifespan=lifespan
)

# Graceful shutdown
def handle_shutdown(signum, frame):
    logger.info("🛑 Received shutdown signal, cleaning up...")
    sys.exit(0)

signal.signal(signal.SIGINT, handle_shutdown)
signal.signal(signal.SIGTERM, handle_shutdown)

# CORS middleware
cors_origins = [
    origin.strip() 
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") 
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"🌐 CORS configured for origins: {cors_origins}")


# Глобальный обработчик исключений
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Обработчик всех необработанных исключений"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "details": str(exc) if os.getenv("DEBUG", "false").lower() == "true" else None
        }
    )


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check для Koyeb load balancer"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": os.getenv("APP_VERSION", "dev"),
        "database": "connected"
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Корневой эндпоинт с информацией об API"""
    return {
        "name": "Mushroom Bot API",
        "description": "API для учета затрат и аналитики при выращивании вешенок",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "docs": "/docs",
        "health": "/health"
    }


# Подключение роутеров
app.include_router(users.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(plans.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(stats.router, prefix="/api")

logger.info("📡 All routers registered successfully")


# Запуск приложения
if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8080))
    host = "0.0.0.0"
    
    logger.info(f"🚀 Starting server on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.getenv("DEBUG", "false").lower() == "true",
        log_level="info" if os.getenv("DEBUG", "false").lower() != "true" else "debug"
    )

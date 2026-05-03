"""
Локальная версия FastAPI приложения для разработки
"""
import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Импорты локальных модулей
from database_local import engine, create_tables
from routers import users, categories, plans, transactions, stats
import local_config

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Запуск приложения
    print("🚀 Запуск локального сервера...")
    create_tables()
    yield
    # Остановка приложения
    print("🛑 Остановка сервера")

app = FastAPI(
    title="Mushroom Bot API (Local)",
    description="Локальная версия API для Telegram Mini App",
    version="1.0.0",
    lifespan=lifespan
)

# CORS для локальной разработки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(categories.router, prefix="/categories", tags=["categories"])
app.include_router(plans.router, prefix="/plans", tags=["plans"])
app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
app.include_router(stats.router, prefix="/stats", tags=["stats"])

@app.get("/")
async def root():
    return {
        "message": "🍄 Mushroom Bot API (Local)",
        "version": "1.0.0",
        "docs": "/docs",
        "database": "SQLite (local)"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "SQLite",
        "mode": "development"
    }

if __name__ == "__main__":
    print("🍄 Запуск локального сервера Mushroom Bot API...")
    print("📖 Документация: http://localhost:8000/docs")
    print("🔍 Health check: http://localhost:8000/health")
    
    uvicorn.run(
        "main_local:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )

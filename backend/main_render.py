"""
Упрощенная версия main.py для Render деплоя
"""
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создание FastAPI приложения
app = FastAPI(
    title="Mushroom Bot API (Render)",
    description="API для Telegram Mini App учета грибоводства",
    version="1.0.0"
)

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Временно разрешаем все для теста
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "🍄 Mushroom Bot API работает на Render!",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "mushroom-bot-api",
        "environment": "production"
    }

@app.get("/api/users/me")
async def get_current_user():
    """Тестовый эндпоинт для проверки работы"""
    return {
        "id": 1,
        "tg_user_id": 123456789,
        "first_name": "Тестовый",
        "last_name": "Пользователь",
        "username": "testuser",
        "created_at": "2024-01-01T00:00:00Z"
    }

@app.get("/api/stats/overall")
async def get_overall_stats():
    """Тестовый эндпоинт для проверки работы"""
    return {
        "total_expenses": 10000.0,
        "total_income": 15000.0,
        "profit": 5000.0,
        "roi_percent": 50.0,
        "total_yield_kg": 100.0,
        "growth_days": 30,
        "cost_per_kg": 100.0,
        "active_plans_count": 2
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Запуск Mushroom Bot API на Render...")
    uvicorn.run(
        "main_render:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        log_level="info"
    )

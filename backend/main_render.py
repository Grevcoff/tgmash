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

@app.post("/api/users/ensure")
async def ensure_user():
    """Тестовый эндпоинт для проверки работы"""
    return {
        "id": 1,
        "tg_user_id": 123456789,
        "first_name": "Тестовый",
        "last_name": "Пользователь",
        "username": "testuser",
        "created_at": "2024-01-01T00:00:00Z"
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

@app.get("/api/transactions")
async def get_transactions():
    """Тестовый эндпоинт для транзакций"""
    return [
        {
            "id": 1,
            "plan_id": 1,
            "category_id": 1,
            "amount": 500.0,
            "type": "expense",
            "comment": "Закупка мицелия",
            "date": "2024-01-15",
            "category_name": "Материалы",
            "created_at": "2024-01-15T10:00:00Z"
        },
        {
            "id": 2,
            "plan_id": 1,
            "category_id": 2,
            "amount": 1200.0,
            "type": "income",
            "comment": "Продажа первого урожая",
            "date": "2024-02-20",
            "category_name": "Продажи",
            "created_at": "2024-02-20T15:30:00Z"
        }
    ]

@app.get("/api/plans")
async def get_plans():
    """Тестовый эндпоинт для планов"""
    return [
        {
            "id": 1,
            "name": "Первая партия вешенок",
            "start_date": "2024-01-10",
            "expected_harvest_date": "2024-02-15",
            "expected_yield_kg": 50.0,
            "status": "active",
            "created_at": "2024-01-10T08:00:00Z"
        },
        {
            "id": 2,
            "name": "Вторая партия вешенок",
            "start_date": "2024-02-01",
            "expected_harvest_date": "2024-03-10",
            "expected_yield_kg": 75.0,
            "status": "planning",
            "created_at": "2024-02-01T09:00:00Z"
        }
    ]

@app.get("/api/categories")
async def get_categories():
    """Тестовый эндпоинт для категорий"""
    return [
        {
            "id": 1,
            "name": "Материалы",
            "type": "expense",
            "user_id": 1,
            "created_at": "2024-01-10T08:00:00Z"
        },
        {
            "id": 2,
            "name": "Продажи",
            "type": "income",
            "user_id": 1,
            "created_at": "2024-01-10T08:00:00Z"
        },
        {
            "id": 3,
            "name": "Оборудование",
            "type": "expense",
            "user_id": 1,
            "created_at": "2024-01-10T08:00:00Z"
        },
        {
            "id": 4,
            "name": "Электричество",
            "type": "expense",
            "user_id": 1,
            "created_at": "2024-01-10T08:00:00Z"
        }
    ]

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Запуск Mushroom Bot API на Render...")
    uvicorn.run(
        "main_render:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        log_level="info"
    )

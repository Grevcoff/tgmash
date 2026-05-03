"""
Простой локальный сервер для тестирования API
"""
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime, timedelta
import random

# Модели данных для тестирования
class User(BaseModel):
    id: int
    tg_user_id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    created_at: str

class Category(BaseModel):
    id: int
    name: str
    type: str  # 'expense' or 'income'
    user_id: int
    created_at: str

class Plan(BaseModel):
    id: int
    name: str
    start_date: str
    end_date: Optional[str] = None
    status: str  # 'active' or 'completed'
    user_id: int
    created_at: str

class Transaction(BaseModel):
    id: int
    plan_id: int
    category_id: int
    amount: float
    type: str
    date: str
    comment: Optional[str] = None
    user_id: int
    created_at: str

app = FastAPI(title="Mushroom Bot API (Local Test)", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Тестовые данные
test_users = []
test_categories = []
test_plans = []
test_transactions = []

# Инициализация тестовых данных
def init_test_data():
    if not test_users:
        # Создаем тестового пользователя
        user = User(
            id=1,
            tg_user_id=123456789,
            first_name="Тестовый",
            last_name="Пользователь",
            username="testuser",
            created_at=datetime.now().isoformat()
        )
        test_users.append(user)
        
        # Создаем тестовые категории
        categories = [
            Category(id=1, name="Субстрат", type="expense", user_id=1, created_at=datetime.now().isoformat()),
            Category(id=2, name="Мицелий", type="expense", user_id=1, created_at=datetime.now().isoformat()),
            Category(id=3, name="Электричество", type="expense", user_id=1, created_at=datetime.now().isoformat()),
            Category(id=4, name="Продажа грибов", type="income", user_id=1, created_at=datetime.now().isoformat()),
        ]
        test_categories.extend(categories)
        
        # Создаем тестовый план
        plan = Plan(
            id=1,
            name="Тестовый план выращивания",
            start_date=(datetime.now() - timedelta(days=30)).isoformat(),
            status="active",
            user_id=1,
            created_at=datetime.now().isoformat()
        )
        test_plans.append(plan)
        
        # Создаем тестовые транзакции
        for i in range(10):
            transaction = Transaction(
                id=i+1,
                plan_id=1,
                category_id=random.choice([1, 2, 3]),
                amount=random.uniform(100, 5000),
                type="expense",
                date=(datetime.now() - timedelta(days=i)).isoformat(),
                comment=f"Тестовая транзакция {i+1}",
                user_id=1,
                created_at=datetime.now().isoformat()
            )
            test_transactions.append(transaction)

# Эндпоинты
@app.get("/")
async def root():
    return {"message": "🍄 Mushroom Bot API (Local Test)", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "mode": "local_test"}

@app.get("/users/me", response_model=User)
async def get_current_user():
    init_test_data()
    return test_users[0]

@app.post("/users/ensure", response_model=User)
async def ensure_user():
    init_test_data()
    return test_users[0]

@app.get("/categories", response_model=List[Category])
async def get_categories():
    init_test_data()
    return test_categories

@app.post("/categories", response_model=Category)
async def create_category(category: dict):
    init_test_data()
    new_category = Category(
        id=len(test_categories) + 1,
        name=category.get("name", "Новая категория"),
        type=category.get("type", "expense"),
        user_id=1,
        created_at=datetime.now().isoformat()
    )
    test_categories.append(new_category)
    return new_category

@app.get("/plans", response_model=List[Plan])
async def get_plans():
    init_test_data()
    return test_plans

@app.post("/plans", response_model=Plan)
async def create_plan(plan: dict):
    init_test_data()
    new_plan = Plan(
        id=len(test_plans) + 1,
        name=plan.get("name", "Новый план"),
        start_date=plan.get("start_date", datetime.now().isoformat()),
        status="active",
        user_id=1,
        created_at=datetime.now().isoformat()
    )
    test_plans.append(new_plan)
    return new_plan

@app.get("/transactions", response_model=List[Transaction])
async def get_transactions():
    init_test_data()
    return test_transactions

@app.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: dict):
    init_test_data()
    new_transaction = Transaction(
        id=len(test_transactions) + 1,
        plan_id=transaction.get("plan_id", 1),
        category_id=transaction.get("category_id", 1),
        amount=transaction.get("amount", 0),
        type=transaction.get("type", "expense"),
        date=transaction.get("date", datetime.now().isoformat()),
        comment=transaction.get("comment"),
        user_id=1,
        created_at=datetime.now().isoformat()
    )
    test_transactions.append(new_transaction)
    return new_transaction

@app.get("/stats/overall")
async def get_overall_stats():
    init_test_data()
    expenses = sum(t.amount for t in test_transactions if t.type == "expense")
    income = sum(t.amount for t in test_transactions if t.type == "income")
    profit = income - expenses
    roi = (profit / expenses * 100) if expenses > 0 else 0
    
    return {
        "total_expenses": expenses,
        "total_income": income,
        "profit": profit,
        "roi_percent": roi,
        "total_yield_kg": random.uniform(50, 200),
        "growth_days": 30,
        "cost_per_kg": expenses / 100 if expenses > 0 else 0,
        "active_plans_count": len([p for p in test_plans if p.status == "active"])
    }

if __name__ == "__main__":
    print("🍄 Запуск простого локального сервера...")
    print("📖 API документация: http://localhost:8000/docs")
    print("🔍 Health check: http://localhost:8000/health")
    print("🧪 Тестовые данные будут созданы автоматически")
    
    uvicorn.run(
        "simple_local_server:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )

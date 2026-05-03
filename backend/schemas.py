"""
Pydantic схемы для API запросов и ответов
Валидация входных данных и сериализация ответов
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field, validator


# Enums для Pydantic
class TransactionType(str, Enum):
    EXPENSE = "expense"
    INCOME = "income"


class PlanStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"


class CategoryType(str, Enum):
    EXPENSE = "expense"
    INCOME = "income"


# Базовые схемы
class BaseSchema(BaseModel):
    """Базовая схема с общими полями"""
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: float(v)
        }


# User схемы
class UserBase(BaseSchema):
    tg_user_id: int = Field(..., ge=1)


class UserCreate(UserBase):
    """Создание пользователя"""
    pass


class User(UserBase):
    """Пользователь с ID"""
    id: int
    created_at: datetime


# Category схемы
class CategoryBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=100)
    type: CategoryType = CategoryType.EXPENSE


class CategoryCreate(CategoryBase):
    """Создание категории"""
    pass


class CategoryUpdate(BaseSchema):
    """Обновление категории"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[CategoryType] = None


class Category(CategoryBase):
    """Категория с ID"""
    id: int
    user_id: int
    created_at: datetime


# Plan схемы
class PlanBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=200)
    start_date: datetime
    end_date: Optional[datetime] = None
    revenue: Decimal = Field(default=Decimal("0.00"), ge=0)
    yield_kg: Decimal = Field(default=Decimal("0.00"), ge=0)
    status: PlanStatus = PlanStatus.ACTIVE
    notes: Optional[str] = Field(None, max_length=1000)

    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v and 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class PlanCreate(PlanBase):
    """Создание плана"""
    pass


class PlanUpdate(BaseSchema):
    """Обновление плана"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    revenue: Optional[Decimal] = Field(None, ge=0)
    yield_kg: Optional[Decimal] = Field(None, ge=0)
    status: Optional[PlanStatus] = None
    notes: Optional[str] = Field(None, max_length=1000)

    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v and 'start_date' in values and values['start_date'] and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class Plan(PlanBase):
    """План с ID"""
    id: int
    user_id: int
    created_at: datetime


class PlanWithStats(Plan):
    """План со статистикой транзакций"""
    total_expenses: Decimal = Field(default=Decimal("0.00"))
    total_income: Decimal = Field(default=Decimal("0.00"))
    transaction_count: int = Field(default=0)
    profit: Decimal = Field(default=Decimal("0.00"))
    roi_percent: Decimal = Field(default=Decimal("0.00"))
    cost_per_kg: Decimal = Field(default=Decimal("0.00"))


# Transaction схемы
class TransactionBase(BaseSchema):
    plan_id: int = Field(..., ge=1)
    category_id: int = Field(..., ge=1)
    amount: Decimal = Field(..., ge=0, decimal_places=2)
    date: datetime
    comment: Optional[str] = Field(None, max_length=500)
    type: TransactionType = TransactionType.EXPENSE


class TransactionCreate(TransactionBase):
    """Создание транзакции"""
    pass


class TransactionUpdate(BaseSchema):
    """Обновление транзакции"""
    plan_id: Optional[int] = Field(None, ge=1)
    category_id: Optional[int] = Field(None, ge=1)
    amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    date: Optional[datetime] = None
    comment: Optional[str] = Field(None, max_length=500)
    type: Optional[TransactionType] = None


class Transaction(TransactionBase):
    """Транзакция с ID"""
    id: int
    created_at: datetime


class TransactionWithRelations(Transaction):
    """Транзакция с отношениями"""
    plan_name: str
    category_name: str


# Stats схемы
class CategoryStats(BaseSchema):
    """Статистика по категории"""
    category_name: str
    category_type: TransactionType
    total_amount: Decimal
    transaction_count: int
    percentage: Decimal


class DailyStats(BaseSchema):
    """Статистика по дням"""
    date: datetime
    expenses: Decimal
    income: Decimal
    net: Decimal


class OverallStats(BaseSchema):
    """Общая статистика"""
    total_expenses: Decimal
    total_income: Decimal
    profit: Decimal
    roi_percent: Decimal
    transaction_count: int
    active_plans_count: int
    completed_plans_count: int
    total_yield_kg: Decimal
    cost_per_kg: Decimal
    growth_days: int


class StatsResponse(BaseSchema):
    """Ответ со статистикой"""
    overall: OverallStats
    by_category: List[CategoryStats]
    daily: List[DailyStats]
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None


# Response схемы
class SuccessResponse(BaseSchema):
    """Успешный ответ"""
    success: bool = True
    message: str


class ErrorResponse(BaseSchema):
    """Ответ с ошибкой"""
    success: bool = False
    error: str
    details: Optional[str] = None


# List responses
class PaginatedResponse(BaseSchema):
    """Пагинированный ответ"""
    items: List[dict]
    total: int
    page: int
    size: int
    pages: int


# Export schemas
class CSVExportResponse(BaseSchema):
    """Ответ с CSV экспортом"""
    filename: str
    content_type: str = "text/csv"
    data: str

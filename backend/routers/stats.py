"""
Роутер для получения статистики и аналитики
"""
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, extract, desc

from database import get_db
from models import User, Transaction, Plan, Category
from schemas import (
    StatsResponse,
    OverallStats,
    CategoryStats,
    DailyStats,
    CSVExportResponse
)
from auth import get_current_user_id
from routers.users import get_or_create_user

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/overall", response_model=OverallStats)
async def get_overall_stats(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Получить общую статистику по всем данным пользователя"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Общие суммы расходов и доходов
    expenses_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .join(Plan, Transaction.plan_id == Plan.id)
        .where(
            and_(
                Plan.user_id == user.id,
                Transaction.type == "expense"
            )
        )
    )
    total_expenses = expenses_result.scalar() or 0
    
    income_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .join(Plan, Transaction.plan_id == Plan.id)
        .where(
            and_(
                Plan.user_id == user.id,
                Transaction.type == "income"
            )
        )
    )
    total_income = income_result.scalar() or 0
    
    # Прибыль и ROI
    profit = total_income - total_expenses
    roi_percent = (profit / total_expenses * 100) if total_expenses > 0 else 0
    
    # Количество транзакций
    transaction_count = await db.scalar(
        select(func.count(Transaction.id))
        .join(Plan, Transaction.plan_id == Plan.id)
        .where(Plan.user_id == user.id)
    ) or 0
    
    # Количество планов по статусам
    active_plans_count = await db.scalar(
        select(func.count(Plan.id))
        .where(
            and_(
                Plan.user_id == user.id,
                Plan.status == "active"
            )
        )
    ) or 0
    
    completed_plans_count = await db.scalar(
        select(func.count(Plan.id))
        .where(
            and_(
                Plan.user_id == user.id,
                Plan.status == "completed"
            )
        )
    ) or 0
    
    # Общий урожай
    total_yield_result = await db.execute(
        select(func.coalesce(func.sum(Plan.yield_kg), 0))
        .where(Plan.user_id == user.id)
    )
    total_yield_kg = total_yield_result.scalar() or 0
    
    # Себестоимость за кг
    cost_per_kg = (total_expenses / total_yield_kg) if total_yield_kg > 0 else 0
    
    # Дней роста (от первого плана до сегодня)
    first_plan_result = await db.execute(
        select(func.min(Plan.start_date))
        .where(Plan.user_id == user.id)
    )
    first_plan_date = first_plan_result.scalar()
    
    growth_days = 0
    if first_plan_date:
        growth_days = (datetime.utcnow() - first_plan_date).days
    
    return OverallStats(
        total_expenses=total_expenses,
        total_income=total_income,
        profit=profit,
        roi_percent=roi_percent,
        transaction_count=transaction_count,
        active_plans_count=active_plans_count,
        completed_plans_count=completed_plans_count,
        total_yield_kg=total_yield_kg,
        cost_per_kg=cost_per_kg,
        growth_days=growth_days
    )


@router.get("/by-category", response_model=List[CategoryStats])
async def get_stats_by_category(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Получить статистику по категориям"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Получаем статистику по категориям
    query = (
        select(
            Category.name.label("category_name"),
            Category.type.label("category_type"),
            func.coalesce(func.sum(Transaction.amount), 0).label("total_amount"),
            func.count(Transaction.id).label("transaction_count")
        )
        .join(Transaction, Category.id == Transaction.category_id)
        .join(Plan, Transaction.plan_id == Plan.id)
        .where(Plan.user_id == user.id)
        .group_by(Category.id, Category.name, Category.type)
        .order_by(desc("total_amount"))
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    # Считаем общую сумму для расчета процентов
    total_amount = sum(row.total_amount for row in rows)
    
    # Формируем ответ
    category_stats = []
    for row in rows:
        percentage = (row.total_amount / total_amount * 100) if total_amount > 0 else 0
        category_stats.append(CategoryStats(
            category_name=row.category_name,
            category_type=row.category_type,
            total_amount=row.total_amount,
            transaction_count=row.transaction_count,
            percentage=percentage
        ))
    
    return category_stats


@router.get("/daily", response_model=List[DailyStats])
async def get_daily_stats(
    days: int = Query(30, ge=1, le=365, description="Количество дней"),
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Получить статистику по дням за последние N дней"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Начальная дата
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Получаем статистику по дням
    query = (
        select(
            func.date(Transaction.date).label("date"),
            func.coalesce(
                func.sum(
                    func.case(
                        (Transaction.type == "expense", Transaction.amount),
                        else_=0
                    )
                ), 0
            ).label("expenses"),
            func.coalesce(
                func.sum(
                    func.case(
                        (Transaction.type == "income", Transaction.amount),
                        else_=0
                    )
                ), 0
            ).label("income")
        )
        .join(Plan, Transaction.plan_id == Plan.id)
        .where(
            and_(
                Plan.user_id == user.id,
                Transaction.date >= start_date
            )
        )
        .group_by(func.date(Transaction.date))
        .order_by(func.date(Transaction.date))
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    # Формируем ответ
    daily_stats = []
    for row in rows:
        net = row.income - row.expenses
        daily_stats.append(DailyStats(
            date=datetime.combine(row.date, datetime.min.time()),
            expenses=row.expenses,
            income=row.income,
            net=net
        ))
    
    return daily_stats


@router.get("/full", response_model=StatsResponse)
async def get_full_stats(
    days: int = Query(30, ge=1, le=365, description="Количество дней для дневной статистики"),
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Получить полную статистику (общая + по категориям + по дням)"""
    # Получаем все компоненты статистики
    overall = await get_overall_stats(current_user_id, db)
    by_category = await get_stats_by_category(current_user_id, db)
    daily = await get_daily_stats(days, current_user_id, db)
    
    # Определяем период
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    return StatsResponse(
        overall=overall,
        by_category=by_category,
        daily=daily,
        period_start=start_date,
        period_end=end_date
    )


@router.get("/export/csv", response_model=CSVExportResponse)
async def export_csv(
    plan_id: Optional[int] = Query(None, description="Фильтр по плану"),
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Экспортировать транзакции в CSV"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Строим запрос
    query = (
        select(
            Transaction.date,
            Transaction.type,
            Transaction.amount,
            Transaction.comment,
            Plan.name.label("plan_name"),
            Category.name.label("category_name")
        )
        .join(Plan, Transaction.plan_id == Plan.id)
        .join(Category, Transaction.category_id == Category.id)
        .where(Plan.user_id == user.id)
    )
    
    if plan_id:
        query = query.where(Transaction.plan_id == plan_id)
    
    query = query.order_by(desc(Transaction.date))
    
    result = await db.execute(query)
    rows = result.all()
    
    # Формируем CSV
    csv_lines = []
    csv_lines.append("Date,Type,Amount,Plan,Category,Comment")
    
    for row in rows:
        date_str = row.date.strftime("%Y-%m-%d %H:%M:%S")
        amount_str = str(float(row.amount)).replace(".", ",")
        comment_str = str(row.comment or "").replace('"', '""')
        plan_str = str(row.plan_name).replace('"', '""')
        category_str = str(row.category_name).replace('"', '""')
        
        csv_lines.append(f'"{date_str}","{row.type}","{amount_str}","{plan_str}","{category_str}","{comment_str}"')
    
    csv_content = "\n".join(csv_lines)
    
    # Имя файла
    filename = f"transactions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return CSVExportResponse(
        filename=filename,
        data=csv_content
    )

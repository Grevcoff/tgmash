"""
Роутер для работы с планами выращивания
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc
from sqlalchemy.orm import selectinload

from database import get_db
from models import User, Plan, Transaction
from schemas import (
    Plan as PlanSchema,
    PlanWithStats,
    PlanCreate,
    PlanUpdate,
    SuccessResponse
)
from auth import get_current_user_id
from routers.users import get_or_create_user

router = APIRouter(prefix="/plans", tags=["plans"])


async def calculate_plan_stats(db: AsyncSession, plan_id: int) -> dict:
    """Рассчитать статистику для плана"""
    # Суммы расходов и доходов
    expenses_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            and_(
                Transaction.plan_id == plan_id,
                Transaction.type == "expense"
            )
        )
    )
    total_expenses = expenses_result.scalar() or 0
    
    income_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            and_(
                Transaction.plan_id == plan_id,
                Transaction.type == "income"
            )
        )
    )
    total_income = income_result.scalar() or 0
    
    # Количество транзакций
    count_result = await db.execute(
        select(func.count(Transaction.id)).where(Transaction.plan_id == plan_id)
    )
    transaction_count = count_result.scalar() or 0
    
    # Прибыль и ROI
    profit = total_income - total_expenses
    roi_percent = (profit / total_expenses * 100) if total_expenses > 0 else 0
    
    # Себестоимость за кг
    plan = await db.get(Plan, plan_id)
    cost_per_kg = (total_expenses / plan.yield_kg) if plan and plan.yield_kg > 0 else 0
    
    return {
        "total_expenses": total_expenses,
        "total_income": total_income,
        "transaction_count": transaction_count,
        "profit": profit,
        "roi_percent": roi_percent,
        "cost_per_kg": cost_per_kg
    }


@router.get("/", response_model=List[PlanWithStats])
async def get_plans(
    status: Optional[str] = Query(None, description="Фильтр по статусу (active/completed)"),
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Получить список планов пользователя"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Строим запрос
    query = select(Plan).where(Plan.user_id == user.id)
    
    # Фильтр по статусу
    if status:
        query = query.where(Plan.status == status)
    
    # Сортировка по дате создания (новые первые)
    query = query.order_by(desc(Plan.created_at))
    
    result = await db.execute(query)
    plans = result.scalars().all()
    
    # Добавляем статистику
    plans_with_stats = []
    for plan in plans:
        stats = await calculate_plan_stats(db, plan.id)
        
        plan_dict = {
            "id": plan.id,
            "user_id": plan.user_id,
            "name": plan.name,
            "start_date": plan.start_date,
            "end_date": plan.end_date,
            "revenue": plan.revenue,
            "yield_kg": plan.yield_kg,
            "status": plan.status,
            "notes": plan.notes,
            "created_at": plan.created_at,
            **stats
        }
        plans_with_stats.append(PlanWithStats(**plan_dict))
    
    return plans_with_stats


@router.post("/", response_model=PlanWithStats)
async def create_plan(
    plan_data: PlanCreate,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Создать новый план"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Создаем план
    plan = Plan(
        user_id=user.id,
        name=plan_data.name,
        start_date=plan_data.start_date,
        end_date=plan_data.end_date,
        revenue=plan_data.revenue,
        yield_kg=plan_data.yield_kg,
        status=plan_data.status,
        notes=plan_data.notes
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    
    # Добавляем статистику
    stats = await calculate_plan_stats(db, plan.id)
    
    plan_dict = {
        "id": plan.id,
        "user_id": plan.user_id,
        "name": plan.name,
        "start_date": plan.start_date,
        "end_date": plan.end_date,
        "revenue": plan.revenue,
        "yield_kg": plan.yield_kg,
        "status": plan.status,
        "notes": plan.notes,
        "created_at": plan.created_at,
        **stats
    }
    
    return PlanWithStats(**plan_dict)


@router.get("/{plan_id}", response_model=PlanWithStats)
async def get_plan(
    plan_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Получить план по ID"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Ищем план
    result = await db.execute(
        select(Plan).where(
            and_(
                Plan.id == plan_id,
                Plan.user_id == user.id
            )
        )
    )
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    # Добавляем статистику
    stats = await calculate_plan_stats(db, plan.id)
    
    plan_dict = {
        "id": plan.id,
        "user_id": plan.user_id,
        "name": plan.name,
        "start_date": plan.start_date,
        "end_date": plan.end_date,
        "revenue": plan.revenue,
        "yield_kg": plan.yield_kg,
        "status": plan.status,
        "notes": plan.notes,
        "created_at": plan.created_at,
        **stats
    }
    
    return PlanWithStats(**plan_dict)


@router.put("/{plan_id}", response_model=PlanWithStats)
async def update_plan(
    plan_id: int,
    plan_data: PlanUpdate,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Обновить план"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Ищем план
    result = await db.execute(
        select(Plan).where(
            and_(
                Plan.id == plan_id,
                Plan.user_id == user.id
            )
        )
    )
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    # Обновляем поля
    update_data = plan_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    
    await db.commit()
    await db.refresh(plan)
    
    # Добавляем статистику
    stats = await calculate_plan_stats(db, plan.id)
    
    plan_dict = {
        "id": plan.id,
        "user_id": plan.user_id,
        "name": plan.name,
        "start_date": plan.start_date,
        "end_date": plan.end_date,
        "revenue": plan.revenue,
        "yield_kg": plan.yield_kg,
        "status": plan.status,
        "notes": plan.notes,
        "created_at": plan.created_at,
        **stats
    }
    
    return PlanWithStats(**plan_dict)


@router.delete("/{plan_id}", response_model=SuccessResponse)
async def delete_plan(
    plan_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Удалить план (каскадно удалятся все транзакции)"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Ищем план
    result = await db.execute(
        select(Plan).where(
            and_(
                Plan.id == plan_id,
                Plan.user_id == user.id
            )
        )
    )
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    # Удаляем план (каскадно удалятся транзакции)
    await db.delete(plan)
    await db.commit()
    
    return SuccessResponse(message="Plan and all related transactions deleted successfully")


@router.post("/{plan_id}/complete", response_model=PlanWithStats)
async def complete_plan(
    plan_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Завершить план"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Ищем план
    result = await db.execute(
        select(Plan).where(
            and_(
                Plan.id == plan_id,
                Plan.user_id == user.id,
                Plan.status == "active"
            )
        )
    )
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active plan not found"
        )
    
    # Завершаем план
    plan.status = "completed"
    plan.end_date = datetime.utcnow()
    
    await db.commit()
    await db.refresh(plan)
    
    # Добавляем статистику
    stats = await calculate_plan_stats(db, plan.id)
    
    plan_dict = {
        "id": plan.id,
        "user_id": plan.user_id,
        "name": plan.name,
        "start_date": plan.start_date,
        "end_date": plan.end_date,
        "revenue": plan.revenue,
        "yield_kg": plan.yield_kg,
        "status": plan.status,
        "notes": plan.notes,
        "created_at": plan.created_at,
        **stats
    }
    
    return PlanWithStats(**plan_dict)

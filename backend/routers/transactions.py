"""
Роутер для работы с транзакциями (расходами/доходами)
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc
from sqlalchemy.orm import selectinload

from database import get_db
from models import User, Transaction, Plan, Category
from schemas import (
    Transaction as TransactionSchema,
    TransactionWithRelations,
    TransactionCreate,
    TransactionUpdate,
    SuccessResponse
)
from auth import get_current_user_id
from routers.users import get_or_create_user

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=List[TransactionWithRelations])
async def get_transactions(
    plan_id: Optional[int] = Query(None, description="Фильтр по плану"),
    category_id: Optional[int] = Query(None, description="Фильтр по категории"),
    type: Optional[str] = Query(None, description="Фильтр по типу (expense/income)"),
    limit: int = Query(50, ge=1, le=100, description="Лимит записей"),
    offset: int = Query(0, ge=0, description="Смещение"),
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Получить список транзакций пользователя"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Строим базовый запрос с JOIN для получения связанных данных
    query = (
        select(
            Transaction,
            Plan.name.label("plan_name"),
            Category.name.label("category_name")
        )
        .join(Plan, Transaction.plan_id == Plan.id)
        .join(Category, Transaction.category_id == Category.id)
        .where(Plan.user_id == user.id)
    )
    
    # Фильтры
    if plan_id:
        query = query.where(Transaction.plan_id == plan_id)
    
    if category_id:
        query = query.where(Transaction.category_id == category_id)
    
    if type:
        query = query.where(Transaction.type == type)
    
    # Сортировка по дате (новые первые)
    query = query.order_by(desc(Transaction.date))
    
    # Пагинация
    query = query.limit(limit).offset(offset)
    
    result = await db.execute(query)
    rows = result.all()
    
    # Формируем ответ
    transactions = []
    for row in rows:
        transaction, plan_name, category_name = row
        transaction_dict = {
            "id": transaction.id,
            "plan_id": transaction.plan_id,
            "category_id": transaction.category_id,
            "amount": transaction.amount,
            "date": transaction.date,
            "comment": transaction.comment,
            "type": transaction.type,
            "created_at": transaction.created_at,
            "plan_name": plan_name,
            "category_name": category_name
        }
        transactions.append(TransactionWithRelations(**transaction_dict))
    
    return transactions


@router.post("/", response_model=TransactionWithRelations)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Создать новую транзакцию"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Проверяем существование плана
    plan_result = await db.execute(
        select(Plan).where(
            and_(
                Plan.id == transaction_data.plan_id,
                Plan.user_id == user.id
            )
        )
    )
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    # Проверяем существование категории
    category_result = await db.execute(
        select(Category).where(
            and_(
                Category.id == transaction_data.category_id,
                Category.user_id == user.id
            )
        )
    )
    category = category_result.scalar_one_or_none()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Создаем транзакцию
    transaction = Transaction(
        plan_id=transaction_data.plan_id,
        category_id=transaction_data.category_id,
        amount=transaction_data.amount,
        date=transaction_data.date,
        comment=transaction_data.comment,
        type=transaction_data.type
    )
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    
    # Формируем ответ с отношениями
    transaction_dict = {
        "id": transaction.id,
        "plan_id": transaction.plan_id,
        "category_id": transaction.category_id,
        "amount": transaction.amount,
        "date": transaction.date,
        "comment": transaction.comment,
        "type": transaction.type,
        "created_at": transaction.created_at,
        "plan_name": plan.name,
        "category_name": category.name
    }
    
    return TransactionWithRelations(**transaction_dict)


@router.get("/{transaction_id}", response_model=TransactionWithRelations)
async def get_transaction(
    transaction_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Получить транзакцию по ID"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Ищем транзакцию с JOIN
    query = (
        select(
            Transaction,
            Plan.name.label("plan_name"),
            Category.name.label("category_name")
        )
        .join(Plan, Transaction.plan_id == Plan.id)
        .join(Category, Transaction.category_id == Category.id)
        .where(
            and_(
                Transaction.id == transaction_id,
                Plan.user_id == user.id
            )
        )
    )
    
    result = await db.execute(query)
    row = result.first()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    transaction, plan_name, category_name = row
    
    transaction_dict = {
        "id": transaction.id,
        "plan_id": transaction.plan_id,
        "category_id": transaction.category_id,
        "amount": transaction.amount,
        "date": transaction.date,
        "comment": transaction.comment,
        "type": transaction.type,
        "created_at": transaction.created_at,
        "plan_name": plan_name,
        "category_name": category_name
    }
    
    return TransactionWithRelations(**transaction_dict)


@router.put("/{transaction_id}", response_model=TransactionWithRelations)
async def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Обновить транзакцию"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Ищем транзакцию
    query = (
        select(Transaction)
        .join(Plan, Transaction.plan_id == Plan.id)
        .where(
            and_(
                Transaction.id == transaction_id,
                Plan.user_id == user.id
            )
        )
    )
    
    result = await db.execute(query)
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Проверяем план и категорию при изменении
    update_data = transaction_data.model_dump(exclude_unset=True)
    
    if "plan_id" in update_data:
        plan_result = await db.execute(
            select(Plan).where(
                and_(
                    Plan.id == update_data["plan_id"],
                    Plan.user_id == user.id
                )
            )
        )
        plan = plan_result.scalar_one_or_none()
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan not found"
            )
    
    if "category_id" in update_data:
        category_result = await db.execute(
            select(Category).where(
                and_(
                    Category.id == update_data["category_id"],
                    Category.user_id == user.id
                )
            )
        )
        category = category_result.scalar_one_or_none()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
    
    # Обновляем поля
    for field, value in update_data.items():
        setattr(transaction, field, value)
    
    await db.commit()
    await db.refresh(transaction)
    
    # Получаем связанные данные для ответа
    plan_result = await db.execute(select(Plan).where(Plan.id == transaction.plan_id))
    plan = plan_result.scalar_one()
    
    category_result = await db.execute(select(Category).where(Category.id == transaction.category_id))
    category = category_result.scalar_one()
    
    transaction_dict = {
        "id": transaction.id,
        "plan_id": transaction.plan_id,
        "category_id": transaction.category_id,
        "amount": transaction.amount,
        "date": transaction.date,
        "comment": transaction.comment,
        "type": transaction.type,
        "created_at": transaction.created_at,
        "plan_name": plan.name,
        "category_name": category.name
    }
    
    return TransactionWithRelations(**transaction_dict)


@router.delete("/{transaction_id}", response_model=SuccessResponse)
async def delete_transaction(
    transaction_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Удалить транзакцию"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Ищем транзакцию
    query = (
        select(Transaction)
        .join(Plan, Transaction.plan_id == Plan.id)
        .where(
            and_(
                Transaction.id == transaction_id,
                Plan.user_id == user.id
            )
        )
    )
    
    result = await db.execute(query)
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Удаляем транзакцию
    await db.delete(transaction)
    await db.commit()
    
    return SuccessResponse(message="Transaction deleted successfully")

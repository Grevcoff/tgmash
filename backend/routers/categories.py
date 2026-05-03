"""
Роутер для работы с категориями расходов/доходов
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload

from database import get_db
from models import User, Category, Transaction
from schemas import (
    Category as CategorySchema,
    CategoryCreate,
    CategoryUpdate,
    SuccessResponse
)
from auth import get_current_user_id
from routers.users import get_or_create_user

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[CategorySchema])
async def get_categories(
    type: Optional[str] = Query(None, description="Фильтр по типу (expense/income)"),
    search: Optional[str] = Query(None, description="Поиск по названию"),
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Получить список категорий пользователя"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Строим запрос
    query = select(Category).where(Category.user_id == user.id)
    
    # Фильтр по типу
    if type:
        query = query.where(Category.type == type)
    
    # Поиск по названию
    if search:
        query = query.where(Category.name.ilike(f"%{search}%"))
    
    # Сортировка по имени
    query = query.order_by(Category.name)
    
    result = await db.execute(query)
    categories = result.scalars().all()
    
    return categories


@router.post("/", response_model=CategorySchema)
async def create_category(
    category_data: CategoryCreate,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Создать новую категорию"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Проверяем, что категория с таким именем уже не существует
    existing = await db.execute(
        select(Category).where(
            and_(
                Category.user_id == user.id,
                Category.name == category_data.name
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Category '{category_data.name}' already exists"
        )
    
    # Создаем категорию
    category = Category(
        user_id=user.id,
        name=category_data.name,
        type=category_data.type
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    
    return category


@router.get("/{category_id}", response_model=CategorySchema)
async def get_category(
    category_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Получить категорию по ID"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Ищем категорию
    result = await db.execute(
        select(Category).where(
            and_(
                Category.id == category_id,
                Category.user_id == user.id
            )
        )
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return category


@router.put("/{category_id}", response_model=CategorySchema)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Обновить категорию"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Ищем категорию
    result = await db.execute(
        select(Category).where(
            and_(
                Category.id == category_id,
                Category.user_id == user.id
            )
        )
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Проверяем уникальность имени при изменении
    if category_data.name and category_data.name != category.name:
        existing = await db.execute(
            select(Category).where(
                and_(
                    Category.user_id == user.id,
                    Category.name == category_data.name,
                    Category.id != category_id
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Category '{category_data.name}' already exists"
            )
    
    # Обновляем поля
    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    await db.commit()
    await db.refresh(category)
    
    return category


@router.delete("/{category_id}", response_model=SuccessResponse)
async def delete_category(
    category_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Удалить категорию (только если нет связанных транзакций)"""
    # Получаем пользователя
    user = await get_or_create_user(db, current_user_id)
    
    # Ищем категорию
    result = await db.execute(
        select(Category).where(
            and_(
                Category.id == category_id,
                Category.user_id == user.id
            )
        )
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Проверяем наличие связанных транзакций
    transactions_count = await db.scalar(
        select(func.count(Transaction.id)).where(
            Transaction.category_id == category_id
        )
    )
    
    if transactions_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete category with {transactions_count} transactions"
        )
    
    # Удаляем категорию
    await db.delete(category)
    await db.commit()
    
    return SuccessResponse(message="Category deleted successfully")

"""
Роутер для работы с пользователями
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User
from schemas import User as UserSchema, UserCreate, SuccessResponse
from auth import get_current_user_id

router = APIRouter(prefix="/users", tags=["users"])


async def get_or_create_user(
    db: AsyncSession,
    tg_user_id: int
) -> User:
    """Получает или создает пользователя"""
    # Проверяем существующего пользователя
    result = await db.execute(
        select(User).where(User.tg_user_id == tg_user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        # Создаем нового пользователя
        user = User(tg_user_id=tg_user_id)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    return user


@router.get("/me", response_model=UserSchema)
async def get_current_user(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Получить информацию о текущем пользователе"""
    user = await get_or_create_user(db, current_user_id)
    return user


@router.post("/ensure", response_model=UserSchema)
async def ensure_user_exists(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Убедиться что пользователь существует (создать если нет)"""
    user = await get_or_create_user(db, current_user_id)
    return user


@router.delete("/me", response_model=SuccessResponse)
async def delete_current_user(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Удалить текущего пользователя и все его данные"""
    # Находим пользователя
    result = await db.execute(
        select(User).where(User.tg_user_id == current_user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Удаляем пользователя (каскадно удалятся все связанные данные)
    await db.delete(user)
    await db.commit()
    
    return SuccessResponse(message="User and all related data deleted successfully")

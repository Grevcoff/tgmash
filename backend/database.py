"""
Настройка подключения к базе данных и сессий SQLAlchemy
Поддержка Supabase с автоматическим добавлением sslmode=require
"""
import os
from urllib.parse import urlparse, parse_qs, urlencode
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
import logging

logger = logging.getLogger(__name__)


def prepare_database_url(url: str) -> str:
    """
    Добавляет sslmode=require для Supabase, если нужно
    и устанавливает application_name для мониторинга
    """
    if "supabase.com" in url and "sslmode" not in url:
        parsed = urlparse(url)
        query = parse_qs(parsed.query)
        query["sslmode"] = ["require"]
        query["application_name"] = ["mushroom_bot"]
        new_query = urlencode(query, doseq=True)
        return parsed._replace(query=new_query).geturl()
    return url


# Получаем URL базы данных из переменных окружения
DATABASE_URL = prepare_database_url(os.getenv("DATABASE_URL", ""))

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Создаем асинхронный движок
engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("DEBUG", "false").lower() == "true",
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Создаем фабрику сессий
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Базовая модель для всех SQLAlchemy моделей"""
    pass


async def get_db() -> AsyncSession:
    """
    Зависимость для получения сессии базы данных
    Используется в FastAPI эндпоинтах через Depends(get_db)
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Инициализация базы данных - создание всех таблиц"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created successfully")


async def close_db():
    """Закрытие соединений с базой данных"""
    await engine.dispose()
    logger.info("Database connections closed")

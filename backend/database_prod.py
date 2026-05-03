"""
Продакшен конфигурация базы данных
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Получаем URL базы данных
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Создаем engine с настройками для продакшена
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Проверка соединения перед использованием
    pool_recycle=300,    # Пересоздание соединений каждые 5 минут
    echo=False           # Отключаем логирование SQL в продакшене
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Создаем все таблицы в базе данных"""
    Base.metadata.create_all(bind=engine)
    print("✅ Продакшен таблицы созданы успешно")

if __name__ == "__main__":
    create_tables()

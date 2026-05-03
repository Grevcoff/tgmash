"""
Локальная конфигурация базы данных для разработки
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Локальная база данных SQLite
SQLITE_DATABASE_URL = "sqlite:///./mushroom_local.db"

# Создаем engine для SQLite с настройками для разработки
engine = create_engine(
    SQLITE_DATABASE_URL,
    connect_args={
        "check_same_thread": False,  # Позволяет использовать несколько потоков
    },
    poolclass=StaticPool,
    echo=True,  # Показываем SQL запросы для отладки
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
    print("✅ Таблицы созданы успешно")

if __name__ == "__main__":
    create_tables()

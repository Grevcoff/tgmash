"""
Локальная конфигурация для разработки
"""
import os
from dotenv import load_dotenv

# Загружаем переменные из .env если существует
load_dotenv()

# Локальные настройки для разработки
DATABASE_URL = "sqlite:///./mushroom_local.db"
TELEGRAM_BOT_TOKEN = "test_token_for_development"  # Заглушка для локальной разработки
CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
PORT = 8000

# Для локальной разработки отключаем строгую валидацию Telegram
DEBUG_MODE = True

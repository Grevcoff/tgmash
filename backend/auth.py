"""
Валидация Telegram WebApp initData
Алгоритм проверки HMAC-SHA256 подписи
"""
import os
import hashlib
import hmac
import urllib.parse
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


class TelegramAuthError(Exception):
    """Ошибка аутентификации Telegram"""
    pass


def parse_init_data(init_data: str) -> Dict[str, str]:
    """
    Парсит initData в словарь параметров
    """
    try:
        return dict(urllib.parse.parse_qsl(init_data))
    except Exception as e:
        logger.error(f"Failed to parse initData: {e}")
        raise TelegramAuthError("Invalid initData format")


def create_data_check_string(data: Dict[str, str]) -> str:
    """
    Создает строку для проверки подписи
    Сортирует все параметры кроме hash и объединяет через \n
    """
    # Удаляем hash из данных
    filtered_data = {k: v for k, v in data.items() if k != "hash"}
    
    # Сортируем по ключам
    sorted_items = sorted(filtered_data.items())
    
    # Создаем строку параметров
    return "\n".join([f"{k}={v}" for k, v in sorted_items])


def verify_hash(data_check_string: str, hash_value: str, bot_token: str) -> bool:
    """
    Проверяет HMAC-SHA256 подпись
    """
    # Создаем секретный ключ из bot_token
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    
    # Вычисляем HMAC-SHA256
    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Сравниваем с полученным хешем
    return calculated_hash == hash_value


def validate_auth_date(auth_date: str, max_age_hours: int = 24) -> bool:
    """
    Проверяет, что auth_date не старше max_age_hours
    """
    try:
        auth_timestamp = int(auth_date)
        auth_datetime = datetime.fromtimestamp(auth_timestamp, timezone.utc)
        now = datetime.now(timezone.utc)
        
        age_hours = (now - auth_datetime).total_seconds() / 3600
        return age_hours <= max_age_hours
    except (ValueError, TypeError):
        return False


def extract_user_id(data: Dict[str, str]) -> Optional[int]:
    """
    Извлекает user_id из параметра user
    """
    user_str = data.get("user")
    if not user_str:
        return None
    
    try:
        # user - это JSON строка
        import json
        user_data = json.loads(user_str)
        return user_data.get("id")
    except (json.JSONDecodeError, TypeError):
        return None


async def validate_telegram_init_data(init_data: str) -> int:
    """
    Валидирует Telegram WebApp initData и возвращает user_id
    
    Raises:
        TelegramAuthError: если валидация не пройдена
    """
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        raise TelegramAuthError("TELEGRAM_BOT_TOKEN not configured")
    
    # Парсим данные
    data = parse_init_data(init_data)
    
    # Проверяем наличие hash
    if "hash" not in data:
        raise TelegramAuthError("Missing hash in initData")
    
    # Проверяем auth_date
    auth_date = data.get("auth_date")
    if not auth_date or not validate_auth_date(auth_date):
        raise TelegramAuthError("Invalid or expired auth_date")
    
    # Извлекаем user_id
    user_id = extract_user_id(data)
    if not user_id:
        raise TelegramAuthError("Invalid user data")
    
    # Создаем строку для проверки
    data_check_string = create_data_check_string(data)
    
    # Проверяем подпись
    if not verify_hash(data_check_string, data["hash"], bot_token):
        raise TelegramAuthError("Invalid hash signature")
    
    logger.info(f"Successfully validated Telegram auth for user_id: {user_id}")
    return user_id


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> int:
    """
    FastAPI зависимость для получения текущего user_id из Authorization header
    
    Ожидает формат: "tma <init_data>"
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Проверяем формат заголовка
    if not credentials.scheme.lower() == "tma":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme. Expected 'tma'",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Валидируем initData и получаем user_id
        user_id = await validate_telegram_init_data(credentials.credentials)
        return user_id
    except TelegramAuthError as e:
        logger.warning(f"Telegram auth failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication error",
        )

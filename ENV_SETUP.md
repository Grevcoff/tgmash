# 📝 Настройка переменных окружения

## Backend (.env)

Создайте файл `backend/.env`:

```env
# Telegram Bot Token (получите от @BotFather)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Database URL (для локальной разработки используйте SQLite)
DATABASE_URL=sqlite:///./mushroom_local.db

# CORS Origins (для локальной разработки)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Server port
PORT=8000

# Режим отладки (для локальной разработки)
DEBUG=true
```

## Frontend (.env)

Создайте файл `frontend/.env`:

```env
# API URL для локальной разработки
VITE_API_URL=http://localhost:8000

# Telegram Bot Username (опционально)
VITE_BOT_USERNAME=your_bot_username

# Режим разработки
VITE_DEV_MODE=true
```

## 🚀 Быстрый старт для локальной разработки

### 1. Backend .env файл:
```bash
cd backend
echo "TELEGRAM_BOT_TOKEN=test_token_for_development" > .env
echo "DATABASE_URL=sqlite:///./mushroom_local.db" >> .env
echo "CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173" >> .env
echo "PORT=8000" >> .env
echo "DEBUG=true" >> .env
```

### 2. Frontend .env файл:
```bash
cd frontend
echo "VITE_API_URL=http://localhost:8000" > .env
echo "VITE_DEV_MODE=true" >> .env
```

## 🔧 Для продакшена

### Backend (.env.production):
```env
TELEGRAM_BOT_TOKEN=real_bot_token
DATABASE_URL=postgresql://user:password@host:port/database
CORS_ORIGINS=https://your-app.vercel.app
PORT=8000
DEBUG=false
```

### Frontend (.env.production):
```env
VITE_API_URL=https://your-backend.koyeb.app
VITE_BOT_USERNAME=your_real_bot_username
VITE_DEV_MODE=false
```

## 📋 Получение Telegram Bot Token

1. Найдите @BotFather в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям
4. Скопируйте полученный токен
5. Вставьте в .env файл

## ⚠️ Важно

- Никогда не добавляйте .env файлы в Git
- Используйте разные токены для разработки и продакшена
- Храните продакшен токены в безопасном месте

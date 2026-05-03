# 🚀 Деплой на Render.com

## 📋 Пошаговая инструкция

### 1. Подготовка аккаунта Render
1. Зарегистрируйтесь на [render.com](https://render.com)
2. Подключите GitHub аккаунт
3. Выберите бесплатный план (Free tier)

### 2. Деплой Backend

#### Создание Web Service
1. В Dashboard нажмите "New +" → "Web Service"
2. **Connect repository**: выберите `Grevcoff/tgmash`
3. **Name**: `mushroom-bot-api`
4. **Environment**: `Python`
5. **Region**: выберите ближайший
6. **Branch**: `main`

#### Конфигурация сборки
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Переменные окружения
Добавьте в Environment Variables:
```
TELEGRAM_BOT_TOKEN=ваш_реальный_токен
CORS_ORIGINS=https://ваше-приложение.vercel.app
PORT=8000
PYTHON_VERSION=3.11.9
```

#### База данных
1. Нажмите "New +" → "PostgreSQL"
2. **Name**: `mushroom-db`
3. **Database Name**: `mushroom`
4. **User**: `mushroom_user`
5. **Plan**: Free

После создания БД, добавьте `DATABASE_URL` в переменные окружения backend.

### 3. Деплой Frontend на Vercel

#### Создание проекта
1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. **Import Git Repository**: `Grevcoff/tgmash`
4. **Root Directory**: `frontend`

#### Конфигурация
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Переменные окружения
Добавьте Environment Variables:
```
VITE_API_URL=https://mushroom-bot-api.onrender.com
```

### 4. Настройка Telegram Bot

#### Получение токена
1. Найдите @BotFather в Telegram
2. `/newbot`
3. Имя: `Mushroom Expense Bot`
4. Username: `your_mushroom_bot`

#### Настройка WebApp
1. В @BotFather: `/mybots`
2. Выберите бота → "Bot Settings" → "Menu Button"
3. Укажите URL вашего Vercel приложения

### 5. Проверка деплоя

#### Backend
- URL: `https://mushroom-bot-api.onrender.com`
- Health: `https://mushroom-bot-api.onrender.com/health`
- Docs: `https://mushroom-bot-api.onrender.com/docs`

#### Frontend
- URL: `https://ваше-приложение.vercel.app`

### 6. Траблшутинг

#### Проблемы с версией Python
Если Render использует не ту версию Python:
1. Убедитесь что есть файл `backend/.python-version`
2. Проверьте `backend/runtime.txt`
3. В настройках сервиса добавьте `PYTHON_VERSION=3.11.9`

#### Ошибки CORS
Убедитесь что `CORS_ORIGINS` содержит правильный URL Vercel приложения.

#### Проблемы с БД
Проверьте что `DATABASE_URL` правильно скопирован из настроек PostgreSQL.

### 7. Мониторинг

Render предоставляет:
- Логи сборки и работы
- Метрики производительности
- Автоматический рестарт при падениях
- SSL сертификаты

## ✅ Готово!

После выполнения этих шагов ваше Telegram Mini App будет работать в продакшене!

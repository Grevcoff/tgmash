# 🚀 Деплой на Koyeb

## 📋 Пошаговая инструкция

### 1. Подготовка аккаунта Koyeb
1. Зарегистрируйтесь на [koyeb.com](https://koyeb.com)
2. Подключите GitHub аккаунт
3. Получите бесплатные кредиты

### 2. Деплой Backend через Docker

#### Сборка и пуш Docker образа
```bash
# Сборка образа
docker build -t ghcr.io/Grevcoff/tgmash/backend:latest ./backend

# Пуш в GitHub Container Registry
docker push ghcr.io/Grevcoff/tgmash/backend:latest
```

#### Создание сервиса на Koyeb
1. Dashboard → "Create Service"
2. **Container Registry**: GitHub Container Registry
3. **Image**: `ghcr.io/Grevcoff/tgmash/backend:latest`
4. **Regions**: выберите ближайшие
5. **Ports**: 8000
6. **Health Check**: `/health`

#### Переменные окружения
```
TELEGRAM_BOT_TOKEN=ваш_реальный_токен
DATABASE_URL=postgresql://user:password@host:port/dbname
CORS_ORIGINS=https://ваше-приложение.vercel.app
PORT=8000
```

### 3. База данных PostgreSQL

#### Вариант А: Koyeb Database
1. Control Panel → "Databases" → "Create Database"
2. **Type**: PostgreSQL
3. **Plan**: Free
4. **Region**: тот же что и сервис

#### Вариант Б: Supabase (рекомендуется)
1. Зарегистрируйтесь на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Получите connection string
4. Добавьте в переменные окружения

### 4. Деплой Frontend на Vercel

Аналогично инструкции в DEPLOY_RENDER.md

### 5. Преимущества Koyeb
- ✅ Полный контроль над Docker окружением
- ✅ Гарантированная версия Python
- ✅ Более гибкие настройки
- ✅ Поддержка GPU (если понадобится)

## ✅ Готово!

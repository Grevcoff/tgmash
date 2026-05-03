# 🍄 Mushroom Telegram Mini App

Telegram Mini App для учета затрат и аналитики при выращивании вешенок. Полноценное приложение с бэкендом на FastAPI и фронтендом на React.

## 🚀 Возможности

### 📊 Основной функционал
- **Учет транзакций**: Добавление расходов и доходов с категориями
- **Планы выращивания**: Создание и управление циклами выращивания
- **Аналитика**: Графики, статистика и экспорт в CSV
- **Категории**: Автодополнение и создание новых категорий
- **Telegram интеграция**: Полная интеграция с Telegram WebApp SDK

### 🎨 UX/UI
- **Адаптивный дизайн**: Оптимизирован для мобильных устройств
- **Темная/светлая тема**: Автоматическая адаптация под Telegram
- **Интуитивная навигация**: Простое и понятное управление
- **Мгновенные уведомления**: Toast-уведомления о действиях

### 📈 Аналитика
- **ROI и прибыль**: Расчет рентабельности инвестиций
- **Себестоимость**: Стоимость производства за кг продукции
- **Динамика**: Графики расходов и доходов по времени
- **Категории**: Распределение затрат по категориям
- **Экспорт**: Выгрузка данных в CSV формат

## 🏗️ Архитектура

### Backend (FastAPI)
```
backend/
├── main.py                 # Основное приложение FastAPI
├── database.py              # Настройка PostgreSQL с SQLAlchemy
├── models.py                # SQLAlchemy модели данных
├── auth.py                  # Валидация Telegram WebApp initData
├── schemas.py               # Pydantic схемы для API
├── routers/                 # FastAPI роутеры
│   ├── users.py            # Управление пользователями
│   ├── categories.py       # Управление категориями
│   ├── plans.py           # Управление планами
│   ├── transactions.py    # Управление транзакциями
│   └── stats.py           # Статистика и аналитика
├── alembic/                # Миграции базы данных
│   ├── versions/           # Версии миграций
│   ├── env.py              # Конфигурация Alembic
│   └── script.py.mako      # Шаблон миграций
├── requirements.txt          # Зависимости Python
├── .env.example           # Пример переменных окружения
├── Dockerfile             # Docker конфигурация
└── prestart.sh            # Скрипт инициализации
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/          # Reusable компоненты
│   │   ├── CategoryAutocomplete.tsx
│   │   ├── TransactionForm.tsx
│   │   └── TelegramButton.tsx
│   ├── screens/            # Экраны приложения
│   │   ├── DashboardScreen.tsx
│   │   ├── PlansScreen.tsx
│   │   ├── AnalyticsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── store/              # Zustand store
│   │   └── useAppStore.ts
│   ├── api/                # API клиент
│   │   ├── client.ts         # Axios с interceptors
│   │   └── endpoints.ts      # Типизированные эндпоинты
│   ├── types/              # TypeScript типы
│   │   └── index.ts
│   ├── utils/              # Утилиты
│   │   ├── format.ts
│   │   ├── calculations.ts
│   │   └── cn.ts
│   ├── App.tsx             # Основной компонент
│   ├── main.tsx            # Точка входа
│   └── index.css            # Глобальные стили
├── package.json             # Зависимости и скрипты
├── vite.config.ts          # Конфигурация Vite
├── tailwind.config.js      # Конфигурация Tailwind CSS
├── tsconfig.json           # Конфигурация TypeScript
└── .env.example           # Пример переменных окружения
```

## 🛠️ Технологический стек

### Backend
- **FastAPI 0.104+**: Современный фреймворк для API
- **SQLAlchemy 2.0+**: Async ORM для работы с PostgreSQL
- **Alembic**: Управление миграциями базы данных
- **Pydantic**: Валидация и сериализация данных
- **python-jose**: JWT и криптография для Telegram
- **asyncpg**: Async драйвер PostgreSQL
- **python-dotenv**: Управление переменными окружения
- **uvicorn**: ASGI сервер для продакшена

### Frontend
- **React 18**: Современный фреймворк с хуками
- **TypeScript**: Статическая типизация
- **Vite**: Быстрый сборщик и dev сервер
- **Tailwind CSS**: Utility-first CSS фреймворк
- **Zustand**: Легковесное управление состоянием
- **React Hook Form + Zod**: Формы с валидацией
- **Axios**: HTTP клиент с interceptors
- **Recharts**: Библиотека для графиков
- **React Hot Toast**: Уведомления
- **Lucide React**: Иконки
- **@twa-dev/sdk**: Telegram WebApp SDK

### База данных
- **PostgreSQL**: Основная база данных
- **Supabase**: Хостинг и управление БД

## 🚀 Деплой в продакшен

### ⚡ Быстрый старт (Render + Vercel)

**Рекомендуемый вариант для новичков:**

1. **Backend на Render**: [DEPLOY_RENDER.md](./DEPLOY_RENDER.md)
2. **Frontend на Vercel**: автоматический деплой
3. **База данных**: PostgreSQL от Render

### 📋 Подробные инструкции

#### Вариант 1: Render.com (рекомендуется)
- 📖 [Полная инструкция](./DEPLOY_RENDER.md)
- ✅ Бесплатный план
- ✅ Автоматический деплой из GitHub
- ✅ Встроенная PostgreSQL
- ⚠️ Ограничение: может использовать последнюю версию Python

#### Вариант 2: Koyeb (продвинутый)
- 📖 [Полная инструкция](./DEPLOY_KOYEB.md)
- ✅ Полный контроль через Docker
- ✅ Гарантированная версия Python 3.11.9
- ✅ Более гибкие настройки
- 💰 Требует платный план для PostgreSQL

### 🔧 Решение проблемы с версией Python

Для Render добавлены файлы:
- `backend/.python-version` - указывает Python 3.11.9
- `backend/runtime.txt` - альтернативный способ
- `backend/render.yaml` - конфигурация сервиса

### 📱 Настройка Telegram Bot

1. **Создайте бота в @BotFather**
   ```
   /newbot
   Mushroom Expense Bot
   @your_bot_username
   ```

2. **Получите токен** и добавьте в переменные окружения

3. **Настройте WebApp**
   - В настройках бота добавьте URL фронтенда
   - Укажите домен Vercel приложения

### 🗄️ База данных

#### Вариант А: Render PostgreSQL (простой)
- Создается вместе с backend сервисом
- Автоматически настраивается
- Бесплатный план

#### Вариант Б: Supabase (гибкий)
- [supabase.com](https://supabase.com)
- Больше возможностей
- Бесплатный план

#### Вариант В: Railway
- [railway.app](https://railway.app)
- Простая настройка
- Хороший бесплатный план

### ✅ Проверка деплоя

После деплоя проверьте:
- Backend: `https://your-app.onrender.com/health`
- Frontend: `https://your-app.vercel.app`
- API Docs: `https://your-app.onrender.com/docs`

## 📱 Локальная разработка

### Backend
```bash
cd backend

# Создайте виртуальное окружение
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или venv\Scripts\activate  # Windows

# Установите зависимости
pip install -r requirements.txt

# Создайте .env файл
cp .env.example .env
# Заполните переменные окружения

# Примените миграции
alembic upgrade head

# Запустите сервер
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend

# Установите зависимости
npm install

# Создайте .env файл
cp .env.example .env
# Заполните VITE_API_URL

# Запустите dev сервер
npm run dev
```

### Telegram WebApp локально
Для локального тестирования WebApp:
1. Запустите бота через `python bot.py`
2. Отправьте команду `/start` боту
3. Откройте полученную ссылку в браузере

## 🗄️ Модели данных

### User
```typescript
interface User {
  id: number;
  tg_user_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  created_at: string;
}
```

### Category
```typescript
interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
  user_id: number;
  created_at: string;
}
```

### Plan
```typescript
interface Plan {
  id: number;
  name: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed';
  user_id: number;
  created_at: string;
}
```

### Transaction
```typescript
interface Transaction {
  id: number;
  plan_id: number;
  category_id: number;
  amount: number;
  type: 'expense' | 'income';
  date: string;
  comment?: string;
  user_id: number;
  created_at: string;
}
```

## 🔧 API Эндпоинты

### Пользователи
- `GET /users/me` - Получить текущего пользователя
- `POST /users/ensure` - Убедиться что пользователь существует
- `DELETE /users/me` - Удалить пользователя

### Категории
- `GET /categories` - Получить категории
- `POST /categories` - Создать категорию
- `GET /categories/{id}` - Получить категорию
- `PUT /categories/{id}` - Обновить категорию
- `DELETE /categories/{id}` - Удалить категорию

### Планы
- `GET /plans` - Получить планы
- `POST /plans` - Создать план
- `GET /plans/{id}` - Получить план
- `PUT /plans/{id}` - Обновить план
- `DELETE /plans/{id}` - Удалить план
- `POST /plans/{id}/complete` - Завершить план

### Транзакции
- `GET /transactions` - Получить транзакции
- `POST /transactions` - Создать транзакцию
- `GET /transactions/{id}` - Получить транзакцию
- `PUT /transactions/{id}` - Обновить транзакцию
- `DELETE /transactions/{id}` - Удалить транзакцию

### Статистика
- `GET /stats/overall` - Общая статистика
- `GET /stats/by-category` - Статистика по категориям
- `GET /stats/daily` - Дневная статистика
- `GET /stats/full` - Полная статистика
- `GET /stats/export/csv` - Экспорт в CSV

## 🔐 Безопасность

### Telegram WebApp аутентификация
- Валидация `initData` через HMAC-SHA256
- Проверка времени жизни данных (max 24 часа)
- Использование секретного ключа бота

### CORS
- Настроен для домена фронтенда
- Поддержка preflight запросов

### Валидация данных
- Pydantic схемы для всех входных данных
- Проверка типов и форматов
- Защита от SQL инъекций через SQLAlchemy

## 📊 Мониторинг

### Логирование
- Структурированные JSON логи в продакшене
- Разные уровни логирования
- Логирование запросов и ошибок

### Health Check
- `GET /health` - Проверка состояния API
- Возвращает статус и временной метку

## 🔄 CI/CD

### GitHub Actions (опционально)
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Koyeb
        # Koyeb deploy action
        
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🐛 Траблшутинг

### Общие проблемы
1. **Ошибка CORS**: Проверьте `CORS_ORIGINS` в backend
2. **База данных**: Убедитесь что DATABASE_URL правильный
3. **Telegram WebApp**: Проверьте что домен добавлен в настройки бота
4. **Переменные окружения**: Проверьте что все переменные установлены

### Локальная разработка
```bash
# Проверить backend health
curl http://localhost:8000/health

# Проверить API
curl -H "Authorization: tma <initData>" http://localhost:8000/users/me

# Проверить фронтенд
# Откройте http://localhost:5173
# Проверьте консоль браузера на ошибки
```

## 📝 TODO

### В планах
- [ ] Push уведомления
- [ ] Мультивалютность
- [ ] Экспорт в другие форматы
- [ ] Интеграция с другими мессенджерами
- [ ] Мобильное приложение

### Улучшения
- [ ] Кэширование API запросов
- [ ] Оптимизация графиков
- [ ] Автоматические бэкапы
- [ ] A/B тестирование UI

## 🤝 Contributing

1. Fork проекта
2. Создайте feature ветку: `git checkout -b feature/amazing-feature`
3. Commit изменения: `git commit -m 'Add amazing feature'`
4. Push в ветку: `git push origin feature/amazing-feature`
5. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 📞 Контакты

- Telegram: [@your_username](https://t.me/your_username)
- Email: your.email@example.com
- GitHub: [github.com/yourusername](https://github.com/yourusername)

---

⭐ Если проект вам помог, поставьте звезду на GitHub!

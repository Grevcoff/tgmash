FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Копируем requirements и устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код
COPY . .

# Создаем директорию для alembic
RUN mkdir -p alembic/versions

# Делаем prestart.sh исполняемым
RUN chmod +x prestart.sh

# Открываем порт
EXPOSE 8080

# Запускаем приложение через prestart.sh
CMD ["/app/prestart.sh"]

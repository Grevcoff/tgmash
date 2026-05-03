#!/bin/bash
set -e

echo "▶️ Applying migrations..."
alembic upgrade head

echo "✅ Starting application..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8080}"

#!/bin/bash
set -e

echo "⏳ Waiting for PostgreSQL..."
while ! python -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.connect(('${POSTGRES_HOST:-db}', ${POSTGRES_PORT:-5432}))
    s.close()
    exit(0)
except:
    exit(1)
" 2>/dev/null; do
    sleep 1
done
echo "✅ PostgreSQL is ready"

echo "🔄 Running migrations..."
python manage.py migrate --noinput

if [ "${LOAD_SAMPLE_DATA:-False}" = "True" ]; then
    echo "🌱 Loading Homie sample data..."
    python manage.py seed_homie --noinput
fi

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput 2>/dev/null || true

echo "🚀 Starting Homie backend..."
if [ "$DEBUG" = "True" ]; then
    python manage.py runserver 0.0.0.0:8000
else
    gunicorn homie_core.wsgi:application --bind 0.0.0.0:8000 --workers 3
fi

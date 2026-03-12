FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

COPY . .

# Tulis entrypoint langsung untuk menghindari CRLF Windows
# Set SKIP_COLLECTSTATIC=1 di env untuk melewati collectstatic (pakai di celery)
RUN printf '#!/bin/sh\nset -e\n\necho "Waiting for PostgreSQL..."\nwhile ! nc -z $DB_HOST $DB_PORT; do\n  sleep 1\ndone\necho "PostgreSQL is ready."\n\necho "Running migrations..."\npython manage.py migrate --noinput\n\nif [ "$SKIP_COLLECTSTATIC" != "1" ]; then\n  echo "Collecting static files..."\n  python manage.py collectstatic --noinput\nfi\n\necho "Starting: $@"\nexec "$@"\n' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-"]

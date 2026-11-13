FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app
RUN pip install --no-cache-dir poetry==2.5.1

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-interaction --no-root

COPY app ./app
COPY alembic.ini ./
COPY alembic ./alembic
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]

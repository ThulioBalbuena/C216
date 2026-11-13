.PHONY: up down logs migrate install-frontend lint test-frontend

up:
	docker compose up -d --build --wait

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	docker compose exec -T backend alembic upgrade head

install-frontend:
	npm --prefix frontend ci

lint:
	docker compose exec -T backend ruff check .
	docker compose exec -T backend ruff format --check .
	npm --prefix frontend run lint

test-frontend:
	npm --prefix frontend test

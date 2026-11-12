.PHONY: up down logs install-frontend lint

up:
	docker compose up -d --build --wait

down:
	docker compose down

logs:
	docker compose logs -f

install-frontend:
	npm --prefix frontend ci

lint:
	docker compose exec -T backend ruff check .
	docker compose exec -T backend ruff format --check .
	npm --prefix frontend run lint

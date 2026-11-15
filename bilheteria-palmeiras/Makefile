.PHONY: up down logs migrate install-frontend install-browser lint test-frontend test-backend test-e2e

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

install-browser:
	cd frontend && npx playwright install $(PLAYWRIGHT_INSTALL_FLAGS) chromium

lint:
	docker compose exec -T backend ruff check .
	docker compose exec -T backend ruff format --check .
	npm --prefix frontend run lint

test-frontend:
	npm --prefix frontend test

test-backend:
	docker compose exec -T backend pytest

test-e2e:
	@address="$$(docker compose port frontend 80)" && \
		BASE_URL="http://$$address" npm --prefix frontend run test:e2e

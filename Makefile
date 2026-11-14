.PHONY: install test lint format run db-upgrade db-migration db-current docker-build docker-test up down restart logs ps shell clean help front-install front-dev front-build front-preview front-lint front-format front-format-check front-check front-test front-test-e2e check-all

PYTEST := poetry -C backend run pytest
UVICORN := poetry -C backend run uvicorn
RUFF := poetry -C backend run ruff
ALEMBIC := poetry -C backend run alembic
COMPOSE := docker compose
FRONT := npm --prefix frontend
.PHONY: up-build frontend-test frontend-check frontend-build e2e

install:
	poetry -C backend install --no-root
test:
	$(PYTEST)
lint:
	$(RUFF) check .
format:
	$(RUFF) format .
run:
	$(UVICORN) app.main:app --reload
db-upgrade:
	$(COMPOSE) exec -T backend alembic upgrade head
db-migration:
	$(ALEMBIC) revision --autogenerate -m "$(msg)"
db-current:
	$(COMPOSE) exec -T backend alembic current
docker-build:
	$(COMPOSE) build backend
docker-test:
	$(COMPOSE) --profile test run --build --rm tests
up: up-build
up-build:
	$(COMPOSE) up -d --build --wait
down:
	$(COMPOSE) down
restart:
	$(COMPOSE) restart
logs:
	$(COMPOSE) logs -f backend
ps:
	$(COMPOSE) ps
shell:
	$(COMPOSE) exec backend /bin/sh
clean:
	$(COMPOSE) down --volumes --remove-orphans
front-install:
	$(FRONT) ci
front-dev:
	$(FRONT) run dev
front-build:
	$(FRONT) run build
front-preview:
	$(FRONT) run preview
front-lint:
	$(FRONT) run lint
front-format:
	$(FRONT) run format
front-format-check:
	$(FRONT) run format:check
front-check:
	$(FRONT) run check
front-test:
	$(FRONT) run test
frontend-test: front-test
frontend-check: front-check
frontend-build: front-build
front-test-e2e: e2e
e2e:
	@set -eu; \
	export API_PORT=18000 FRONTEND_PORT=15173; \
	export VITE_API_URL=http://127.0.0.1:18000; \
	export CORS_ORIGINS=http://127.0.0.1:15173 E2E_BASE_URL=http://127.0.0.1:15173; \
	project=lab-e2e-$$$$; \
	trap '$(COMPOSE) -p "$$project" down --volumes --remove-orphans' EXIT; \
	trap 'exit 130' INT; trap 'exit 143' TERM; \
	$(COMPOSE) -p "$$project" up -d --build --wait --wait-timeout 90 frontend; \
	$(FRONT) run test:e2e
check-all:
	$(MAKE) lint
	$(MAKE) test
	$(MAKE) front-install
	$(MAKE) frontend-check frontend-test frontend-build
	$(MAKE) e2e
help:
	echo "Usage: make <target>"
	echo "Targets:"
	echo "  install - instala dependencias"
	echo "  test - executa testes"
	echo "  lint - verifica erros de codigo"
	echo "  format - formata codigo"
	echo "  run - inicia servidor"
	echo "  db-upgrade - aplica as migrations pendentes"
	echo '  db-migration - gera migration: make db-migration msg="descricao"'
	echo "  db-current - mostra a revisao atual do banco"
	echo "  docker-build - constroi a imagem do backend"
	echo "  docker-test - executa testes unitarios e de integracao em container"
	echo "  up - constroi e inicia os servicos em segundo plano"
	echo "  up-build - constroi e aguarda os servicos do Compose"
	echo "  down - para e remove os containers"
	echo "  restart - reinicia os servicos"
	echo "  logs - acompanha os logs do backend"
	echo "  ps - mostra o estado dos servicos"
	echo "  shell - abre um shell no container do backend"
	echo "  clean - remove containers, rede e volumes"
	echo "  front-install - instala dependencias do frontend (npm ci)"
	echo "  front-dev - inicia o frontend em http://localhost:5173"
	echo "  front-build - gera o build do frontend"
	echo "  front-preview - serve o build do frontend"
	echo "  front-lint - verifica erros de codigo do frontend (Biome)"
	echo "  front-format - formata o codigo do frontend"
	echo "  front-format-check - verifica a formatacao do frontend"
	echo "  front-check - lint, formatacao e imports do frontend"
	echo "  front-test - executa testes unitarios e de integracao do frontend"
	echo "  front-test-e2e - executa os testes E2E do frontend (Playwright)"
	echo "  e2e - testa a integracao com a API e o banco em Compose isolado"
	echo "  check-all - executa o checklist de entrega (backend e frontend)"

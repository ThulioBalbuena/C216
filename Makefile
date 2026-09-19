.PHONY: install test lint format run docker-build up down restart logs ps shell clean help

PYTEST := poetry -C backend run pytest
UVICORN := poetry -C backend run uvicorn
RUFF := poetry -C backend run ruff
COMPOSE := docker compose

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
docker-build:
	$(COMPOSE) build backend
up:
	$(COMPOSE) up -d --build
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
help:
	echo "Usage: make <target>"
	echo "Targets:"
	echo "  install - instala dependencias"
	echo "  test - executa testes"
	echo "  lint - verifica erros de codigo"
	echo "  format - formata codigo"
	echo "  run - inicia servidor"
	echo "  docker-build - constroi a imagem do backend"
	echo "  up - constroi e inicia os servicos em segundo plano"
	echo "  down - para e remove os containers"
	echo "  restart - reinicia os servicos"
	echo "  logs - acompanha os logs do backend"
	echo "  ps - mostra o estado dos servicos"
	echo "  shell - abre um shell no container do backend"
	echo "  clean - remove containers, rede e volumes"

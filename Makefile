.PHONY: install test lint format run help

PYTEST := poetry -C backend run pytest
UVICORN := poetry -C backend run uvicorn
RUFF := poetry -C backend run ruff

install:
	poetry -C backend install
test:
	$(PYTEST)
lint:
	$(RUFF) check .
format:
	$(RUFF) format .
run:
	$(UVICORN) app.main:app --reload
help:
	echo "Usage: make <target>"
	echo "Targets:"
	echo "  install - instala dependencias"
	echo "  test - executa testes"
	echo "  lint - verifica erros de codigo"
	echo "  format - formata codigo"
	echo "  run - inicia servidor"

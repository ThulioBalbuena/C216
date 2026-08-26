.PHONY: install test lint format run help

PYTEST = poetry run pytest
RUFF = poetry run ruff
UVICORN = poetry run uvicorn

install:
	poetry install
test:
	poetry run pytest
lint:
	poetry run ruff check .
format:
	poetry run ruff format .
run:
	poetry run uvicorn app.main:app --reload
help:
	echo "Usage: make <target>"
	echo "Targets:"
	echo "  install - instala dependencias"
	echo "  test - executa testes"
	echo "  lint - verifica erros de codigo"
	echo "  format - formata codigo"
	echo "  run - inicia servidor"
# Bilheteria Palmeiras

Projeto final de C216. 

## Executar localmente

```sh
cp .env.example .env
make up
```

`WEB_PORT` altera a porta da interface. `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` configuram o banco. Use o `.env` local para esses valores.

Na inicialização, a API aplica as migrações do Alembic. O catálogo inclui três partidas de demonstração, com preços e vagas fictícios. A rota `GET /api/matches` lista as partidas e `GET /api/matches/{match_id}` retorna os setores de uma partida.

## Validar e manter

```sh
make install-frontend
make lint
```

`make up` aguarda as verificações de saúde do Docker Compose antes de retornar. A instalação local do frontend e a verificação com Biome usam Node.js 22. O Ruff roda dentro do contêiner da API.

Use `make migrate` para aplicar migrações pendentes com a API em execução, `make logs` para acompanhar os serviços e `make down` para encerrá-los. O volume do PostgreSQL é mantido.

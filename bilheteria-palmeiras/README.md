# Bilheteria Palmeiras

Projeto final de C216. 

## Executar localmente

```sh
cp .env.example .env
make up
```

Abra <http://localhost:8081>. O Nginx serve o frontend e encaminha as requisições em `/api/` à API. A rota `/api/health` verifica a conexão com o PostgreSQL.

`WEB_PORT` altera a porta da interface. `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` configuram o banco. Use o `.env` local para esses valores.

## Validar e manter

```sh
make install-frontend
make lint
```

`make up` aguarda as verificações de saúde do Docker Compose antes de retornar. A instalação local do frontend e a verificação com Biome usam Node.js 22. O Ruff roda dentro do contêiner da API.

Use `make logs` para acompanhar os serviços e `make down` para encerrá-los. O volume do PostgreSQL é mantido.

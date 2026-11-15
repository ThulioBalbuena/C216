# Bilheteria Palmeiras

Projeto final de C216. A aplicação simula a compra de ingressos para jogos do Palmeiras, da escolha do setor no mapa à confirmação do pedido.

## O que dá pra fazer

- Consultar os jogos e ver o preço e as vagas de cada setor.
- Escolher a quantidade, conferir o total e salvar o pedido como rascunho.
- Consultar, editar e excluir rascunhos em Meus ingressos. Ao confirmar um pedido, o sistema desconta as vagas do setor e gera um comprovante.
- Navegar pelo carrossel sobre a história do clube e ver os vídeos recentes da TV Palmeiras.

[Vídeo demonstrativo](https://youtu.be/EnKQQwWrGV8)

## Tecnologias e estrutura

- [`frontend/`](frontend/) usa React e Vite. A interface fica em `src/`, as imagens em `public/media/` e o teste Playwright em `e2e/`. O Nginx serve a aplicação e encaminha as chamadas de `/api` para o backend.
- [`backend/`](backend/) usa FastAPI e Poetry. Em `app/` ficam as rotas, regras de negócio e consultas ao PostgreSQL com SQLAlchemy. As migrações ficam em `alembic/versions/` e os testes da API em `tests/`.
- [`compose.yaml`](compose.yaml) sobe o frontend, a API e o PostgreSQL. O [`Makefile`](Makefile) reúne os comandos de execução, testes e manutenção.

## Pré-requisitos

- Docker com Docker Compose e Make para subir a aplicação.
- Node.js 22 com npm para rodar o lint do frontend, o Vitest e o Playwright.

## Executar localmente

Rode os comandos abaixo na pasta `bilheteria-palmeiras`.

```sh
cp .env.example .env
make up
```

Abra <http://localhost:8081>, escolha uma partida e selecione um setor no mapa ou na lista para consultar o preço total.

`WEB_PORT` altera a porta da interface. `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` configuram o banco. Use o `.env` local para esses valores.

Na inicialização, a API aplica as migrações do Alembic. O catálogo inclui três partidas de demonstração, com preços e vagas fictícios. A rota `GET /api/matches` lista as partidas e `GET /api/matches/{match_id}` retorna os setores de uma partida.

## Validar e manter

```sh
make install-frontend
make lint
make test-frontend
make test-backend
(cd frontend && npx playwright install chromium)
make test-e2e
```

`make up` aguarda as verificações de saúde do Docker Compose antes de retornar. O `make lint` roda Ruff no backend e Biome no frontend.

`make test-e2e` usa a aplicação em execução e consome duas vagas de demonstração ao confirmar um pedido.

Use `make migrate` para aplicar migrações pendentes com a API em execução, `make logs` para acompanhar os serviços e `make down` para encerrá-los. O volume do PostgreSQL é mantido.

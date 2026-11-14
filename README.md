# C216

Projeto desenvolvido para a materia de C216

## Estrutura

```text
.
├── backend/
├── frontend/           # interface React (Prática 6)
├── compose.yaml
├── Makefile
└── README.md
```
## Backend — Prática 5

O backend utiliza FastAPI e está organizado por responsabilidade:

```text
backend/
├── app/
│   ├── main.py             # inicialização e configuração da aplicação
│   ├── api/
│   │   ├── handlers.py     # conversão dos erros de domínio em respostas HTTP
│   │   └── routes/         # endpoints de health e items
│   ├── schemas/            # modelos Pydantic de entrada e resposta
│   ├── services/           # regras dos itens
│   ├── repositories/       # acesso ao banco
│   ├── models/             # modelos ORM SQLAlchemy
│   └── database/           # Base, conexão e sessões
└── tests/
    ├── unit/               # testes diretos do service
    └── integration/        # endpoints via TestClient e testes anteriores
```

Cada item contém `id` (gerado pelo servidor), `name` (1 a 100 caracteres),
`price` (número finito não negativo) e `description` (opcional, até 1000 caracteres).
Os modelos `ItemCreate`, `ItemUpdate` e `ItemResponse` validam esses dados.

| Método | Rota | Comportamento |
| --- | --- | --- |
| GET | `/health` | Verifica a disponibilidade da API |
| GET | `/items` | Lista itens, com filtro `q` por nome e paginação `skip`/`limit` |
| GET | `/items/{item_id}` | Consulta um item |
| POST | `/items` | Cria um item e retorna 201 |
| PUT | `/items/{item_id}` | Substitui o item completo |
| PATCH | `/items/{item_id}` | Atualiza somente os campos informados |
| DELETE | `/items/{item_id}` | Remove o item e retorna 204 sem corpo |

O Path Parameter `item_id` deve ser um inteiro positivo. Os Query Parameters
`skip` e `limit` têm valores padrão 0 e 20; `skip` deve ser não negativo e
`limit` deve estar entre 1 e 100. O filtro `q` procura parte do nome sem diferenciar
maiúsculas e minúsculas, antes da paginação.

PUT exige `name` e `price` e remove a descrição quando ela é omitida. PATCH
preserva os campos omitidos e permite `description: null` para limpar a descrição;
`name` e `price` não aceitam nulo. Itens inexistentes retornam 404 e entradas
inválidas retornam 422.

Os itens são persistidos no PostgreSQL e permanecem após reiniciar a API.
Os schemas Pydantic são separados dos modelos ORM; o service usa o repository
para acessar o banco.

Para executar localmente, instale Python 3.12 ou superior e Poetry 2.4.1:

```bash
make install
docker compose -f compose.yaml -f compose.local.yaml up -d db
export DATABASE_URL='postgresql+psycopg://app:app@localhost:5432/app'
poetry -C backend run alembic upgrade head
make run
```

Aguarde o banco ficar saudável antes de executar a migration. A conexão usa
`DATABASE_URL`, com a URL acima como padrão local. Se mudar as credenciais no
Compose, ajuste também a URL. No Mac, use `localhost`; nos containers, use `db`.

A migration inicial está em `backend/alembic/versions/`. Para alterações futuras:

```bash
make db-migration msg="descricao da alteracao"
make db-upgrade
make db-current
```

A documentação interativa fica em `http://127.0.0.1:8000/docs`. Exemplo de criação:

```bash
curl -X POST http://127.0.0.1:8000/items \
  -H 'Content-Type: application/json' \
  -d '{"name": "Caderno", "price": 12.50, "description": "Capa azul"}'
curl 'http://127.0.0.1:8000/items?q=caderno&skip=0&limit=10'
```

Execute toda a suíte ou cada grupo separadamente:

```bash
make test
poetry -C backend run pytest tests/unit
poetry -C backend run pytest tests/integration
```

O workflow `.github/workflows/ci-backend.yml` executa Ruff e toda a suíte do Pytest
em pushes e pull requests, incluindo os dois grupos e os testes das práticas
anteriores. O relatório JUnit fica disponível como artefato da execução.
Um job adicional valida o Compose, executa os testes em Docker e constrói as
imagens de execução do backend e do worker.

O Dockerfile possui os estágios `base`, `test` e `runtime`. O estágio `test`
inclui as dependências de desenvolvimento e os testes; o `runtime` contém
somente as dependências da aplicação, o pacote `app` e as migrations.
O backend aplica as migrations antes de iniciar no Docker.
Para executar toda a suíte em container, sem iniciar o banco ou o worker:

```bash
make docker-test
# equivalente:
docker compose --profile test run --build --rm tests
```

## Frontend — Prática 7

O frontend lista e cadastra itens por HTTP. A API grava no PostgreSQL; ao
recarregar a página, a lista é buscada novamente. A interface mostra o
carregamento e as mensagens de falha, incluindo a de nome repetido.

| Ferramenta | Para que serve |
| --- | --- |
| React + react-dom | Interface em componentes (JavaScript puro, sem TypeScript) |
| Vite + `@vitejs/plugin-react` | Servidor de desenvolvimento e build |
| Tailwind CSS v4 (`@tailwindcss/vite`) | Estilo com classes utilitárias, sem `tailwind.config.js` e sem PostCSS |
| Biome | Lint, formatação e organização de imports (no lugar de ESLint e Prettier) |
| Vitest + jsdom + Testing Library | Testes unitários e de integração |
| Playwright | Testes E2E no navegador (Chromium) |

### Pré-requisitos

- Node.js 22 ou superior, npm e Git

```bash
node --version
npm --version
git --version
```

### Estrutura

```text
frontend/
├── src/
│   ├── main.jsx            # ponto de entrada
│   ├── App.jsx             # estado dos itens e layout da página
│   ├── index.css           # apenas @import "tailwindcss";
│   ├── validate.js         # regras de validação (funções puras)
│   ├── components/         # ItemForm, ItemList e ItemCard
│   └── services/items.js  # chamadas HTTP de itens
├── tests/
│   ├── unit/               # validação e componentes isolados
│   ├── integration/        # formulário + lista juntos
│   └── e2e/                # fluxo completo no navegador (Playwright)
├── biome.json
├── vite.config.js          # plugins e configuração do Vitest
└── playwright.config.js
```

Cada item tem nome obrigatório, preço não negativo e descrição opcional.
O banco não aceita nomes idênticos. Se um banco das práticas anteriores já
tiver nomes duplicados, revise esses registros antes de aplicar a migration.

### Instalando e executando

```bash
make up-build
make ps
make db-upgrade
make db-current
```

A interface abre em `http://localhost:5173` e o Swagger em
`http://localhost:8000/docs`. O Compose usa `VITE_API_URL` para o endereço
da API visto pelo navegador e `CORS_ORIGINS` (origens separadas por vírgula)
para autorizar o frontend. Para os testes E2E, instale o
Chromium do Playwright uma única vez:

```bash
make front-install
(cd frontend && npx playwright install chromium)
```

### Scripts npm e targets make

Os scripts do npm (dentro de `frontend/`) não substituem o Makefile, que continua
sendo a camada principal a partir da raiz.

| Script npm | Target make | O que faz |
| --- | --- | --- |
| `npm ci` | `make front-install` | Instala as dependências do `package-lock.json` |
| `npm run dev` | `make front-dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | `make frontend-build` | Gera o build em `dist/` |
| `npm run preview` | `make front-preview` | Serve o build gerado |
| `npm run lint` | `make front-lint` | Verifica erros de código (Biome) |
| `npm run format` | `make front-format` | Formata o código |
| `npm run format:check` | `make front-format-check` | Verifica a formatação sem alterar arquivos |
| `npm run check` | `make frontend-check` | Lint, formatação e imports de uma vez |
| `npm run test` | `make frontend-test` | Testes unitários e de integração (Vitest) |
| `npm run test:e2e` | `make e2e` | Testes E2E (Playwright) |

### Testes

Há três níveis de teste:

- **Unitários** (`tests/unit/`): funções de validação e componentes isolados.
- **Integração** (`tests/integration/`): simula `fetch` para verificar carregamento,
  sucesso e mensagens de erro.
- **E2E** (`tests/e2e/`): cadastra na API real, recarrega a página, verifica
  duplicidade e confere o cabeçalho CORS da resposta.

```bash
make frontend-test
make e2e
```

O E2E usa uma stack Compose temporária com portas 15173 e 18000, e remove
seus containers e volume ao terminar.

O Vitest executa apenas `tests/unit` e `tests/integration`; os testes E2E ficam
fora dele e rodam só pelo Playwright.

### CI

O workflow `.github/workflows/ci-frontend.yml` roda em pushes e pull requests. O job
`lint` executa o Biome. O job `test`, que depende do `lint`, verifica a formatação,
roda os testes do Vitest, faz o build, instala o Chromium e roda o E2E. Se algo
falhar, o relatório do Playwright fica disponível como artefato da execução.

### Checklist de entrega

A partir da raiz, com Docker em execução e dependências do backend instaladas:

```bash
make check-all
```

O comando roda lint e testes do backend, checagens e build do frontend, mais o E2E.

## Requisitos do ambiente Docker

- Docker com Docker Compose
- Make 

## Executando o ambiente

Construa as imagens e inicie os serviços:

```bash
make up
```

Comandos equivalentes sem Make:

```bash
docker compose up -d --build
```

O Compose publica as portas 8000 (API) e 5173 (frontend) apenas no loopback.
O arquivo `compose.local.yaml` também publica o PostgreSQL para uso local.
Os serviços se comunicam numa rede interna do projeto:

- O backend acessa o PostgreSQL pelo endereço `db:5432`, configurado em `DATABASE_URL`.
- O worker consulta periodicamente o endpoint `http://backend:8000/health`.
- O Compose inicia o backend quando o banco está saudável, e o frontend e o worker quando a API está saudável.

## Comandos úteis

```bash
make install       # instala as dependências do backend
make test          # executa os testes automatizados
make lint          # verifica erros no código
make format        # formata o código
make run           # inicia a API localmente
make docker-build  # constrói a imagem do backend
make up            # inicia todos os serviços
make down          # encerra os serviços
make restart       # reinicia os serviços
make logs          # acompanha os logs do backend
make ps            # mostra o estado dos serviços
make shell         # abre um shell no backend
make clean         # remove containers, rede e volume do banco
make front-install # instala as dependências do frontend
make front-dev     # inicia o frontend em http://localhost:5173
make front-check   # lint, formatação e imports do frontend
make front-test    # testes unitários e de integração do frontend
make front-test-e2e # testes E2E do frontend
make check-all     # checklist de entrega (backend e frontend)
```

Os testes também são executados automaticamente pelo GitHub Actions a cada `push` e `pull request`.

## Executando os testes

Instale as dependências de desenvolvimento e execute a suíte a partir da raiz do projeto:

```bash
make install
make test
```

O comando executa o Pytest dentro do ambiente Poetry do `backend`. Os testes
usam SQLite temporário para não alterar o banco da aplicação; incluem CRUD e
persistência entre instâncias da API.

Para remover os serviços diretamente com o Docker Compose:

```bash
docker compose down
```

# C216

Projeto desenvolvido para a materia de C216

## Estrutura

```text
.
├── backend/
├── frontend/           # reservada para a interface futura
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
make db-upgrade
make run
```

Aguarde o banco ficar saudável antes de executar `make db-upgrade`. A conexão usa
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

O Compose principal não publica portas no host. O arquivo `compose.local.yaml`
publica o PostgreSQL em `127.0.0.1:5432` para uso local. Os serviços se comunicam
pela rede interna nomeada `c216_network`:

- O backend acessa o PostgreSQL pelo endereço `db:5432`, configurado em `DATABASE_URL`.
- O worker consulta periodicamente o endpoint `http://backend:8000/health`.
- O Compose só inicia o backend depois que o banco está saudável e só inicia o worker depois que a API está saudável.

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

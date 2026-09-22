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
## Requisitos

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

Os serviços não publicam portas no host. Eles se comunicam pela rede interna nomeada `c216_network`:

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

O comando executa o Pytest dentro do ambiente Poetry do `backend`.

Para remover os serviços diretamente com o Docker Compose:

```bash
docker compose down
```


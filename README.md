# GamerTrust backend (`gt-backend`)

- [English](#english)
- [Português (Brasil)](#português-brasil)

REST API for the GamerTrust marketplace (identity, catalog, listings, verification, trust, search, favorites, media).

This is the GamerTrust service, not a generic boilerplate. Layer rules: [`AGENTS.md`](AGENTS.md).

---

## English

REST API for the **GamerTrust** marketplace. Stack: **Node.js**, **TypeScript**, **Express**, **MongoDB** (Mongoose), OpenAPI validation, Jest.

### Documentation

| | |
|--|--|
| Project docs | [docs/en](docs/en/README.md) |
| HTTP API | [docs/en/api](docs/en/api/README.md) |
| Hub | [docs/README.md](docs/README.md) |
| Architecture canon (`ARCH-*` / `DEC-*`) | [docs/architecture](docs/architecture/00-overview.md) |
| Kit layers | [docs/architecture-and-layers.md](docs/architecture-and-layers.md) ([ARCHITECTURE.md](ARCHITECTURE.md)) |
| DeepWiki | [`.devin/wiki.json`](.devin/wiki.json) — how to regenerate: [docs/en/contributing.md](docs/en/contributing.md#deepwiki) |

English is **normative** for identifiers, HTTP paths, and `ARCH-*` / `DEC-*`. If the two copies diverge, English wins.

### Prerequisites

- **Node.js** (see `package.json` / local toolchain)
- **Yarn**
- **Docker** (Compose) for MongoDB and LocalStack in local development
- Integration tests (`yarn test:int`) use **in-memory MongoDB** via `mongodb-memory-server` (`jest/start-integration.ts`); Docker is not required for that suite

### Quick start

1. Clone and install:

   ```bash
   yarn install
   ```

2. Start local MongoDB (single-node replica set, required for transactions):

   ```bash
   docker compose up -d mongodb
   ```

3. Create a **`.env`** at the repo root (`yarn dev` loads `--env-file=.env`):

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URI` | MongoDB URI (required for `databaseSetup`) |
   | `PORT` | HTTP port (optional; default **3000** in `src/app.ts`) |
   | `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins (default: `http://localhost:5173`) |
   | `S3_USE_MEMORY` | `true` uses in-memory media storage (local without LocalStack/AWS) |
   | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | ADMIN credentials for `yarn seed:local` (never hardcode) |

   Minimal example:

   ```env
   PORT=3000
   DATABASE_URI=mongodb://localhost:27017/gamertrust?replicaSet=rs0
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   S3_USE_MEMORY=true
   ```

4. Run in development (hot reload with `ts-node-dev`):

   ```bash
   yarn dev
   ```

5. **Health check:** `GET /health`.

More detail: [docs/en/getting-started.md](docs/en/getting-started.md).

### Main scripts

| Command | Purpose |
|---------|---------|
| `yarn dev` | TS server with reload and `.env` |
| `yarn build` | Compile TypeScript and copy `src/contracts/*.yaml` to `dist/` |
| `yarn start` | `node dist/src/app.js` (after build) |
| `yarn test` | Unit + integration |
| `yarn test:unit` | Unit tests only |
| `yarn test:int` | Integration tests only |
| `yarn test:coverage` | Coverage (target ≥ 80% — see `AGENTS.md`) |
| `yarn lint` / `yarn lint:fix` | ESLint |
| `yarn prettier` | Prettier on `src/**/*.ts` |
| `yarn clean` | Remove `dist` |
| `yarn seed:local` | Local seed (category, product, PUBLISHED listing, ADMIN). Requires `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` |
| `yarn docs:api` | Generate bilingual HTTP API docs from OpenAPI |

### Architecture

Typical flow: **HTTP → Controller (application) → Service (domain) → Repository (contract in domain, implementation in infraestructure) → Mongo + adapters**.

| Doc | Role |
|-----|------|
| [docs/en/architecture](docs/en/architecture/overview.md) | Human-facing architecture |
| [docs/architecture](docs/architecture/00-overview.md) | GamerTrust canon (`ARCH-*`, `DEC-*`) |
| [docs/architecture-and-layers.md](docs/architecture-and-layers.md) | Kit layer rules |
| [AGENTS.md](AGENTS.md) | Naming (`I*`, `IM*`), folders, contribution checklist |

`src/` tree:

```text
src/
├── application/controllers/   # Express: routes, delegate to service
├── configuration/             # dotenv, factories (DI), env-constants
├── contracts/                 # OpenAPI (service.yaml)
├── domain/                    # Entities, services, repository contracts, Server
├── infraestructure/           # Mongo, repos, adapters, i18n errors, SQS/SNS, S3
└── __tests__/                 # Unit and integration
```

Fixed spelling: **`infraestructure`**, **`configuration`**.

### API and OpenAPI

Routes and payloads must match **`src/contracts/service.yaml`**. The server validates requests and responses against that spec. When you change an endpoint, update the YAML, tests, and run `yarn docs:api`.

How to document an endpoint: [docs/en/contributing.md](docs/en/contributing.md).

### License

See `license` in [`package.json`](package.json).

---

## Português (Brasil)

API REST do marketplace **GamerTrust**. Stack: **Node.js**, **TypeScript**, **Express**, **MongoDB** (Mongoose), validação OpenAPI, Jest.

Este é o serviço GamerTrust, não um boilerplate genérico. Regras de camadas: [`AGENTS.md`](AGENTS.md).

### Documentação

| | |
|--|--|
| Docs de projeto | [docs/pt-BR](docs/pt-BR/README.md) |
| API HTTP | [docs/pt-BR/api](docs/pt-BR/api/README.md) |
| Hub | [docs/README.md](docs/README.md) |
| Canon de arquitetura (`ARCH-*` / `DEC-*`) | [docs/architecture](docs/architecture/00-overview.md) |
| Camadas do kit | [docs/architecture-and-layers.md](docs/architecture-and-layers.md) ([ARCHITECTURE.md](ARCHITECTURE.md)) |
| DeepWiki | [`.devin/wiki.json`](.devin/wiki.json) — como regenerar: [docs/pt-BR/contributing.md](docs/pt-BR/contributing.md#deepwiki) |

O inglês é **normativo** para identificadores, paths HTTP e IDs `ARCH-*` / `DEC-*`. Se as duas cópias divergirem, o inglês vence.

### Pré-requisitos

- **Node.js** (ver `package.json` / toolchain local)
- **Yarn**
- **Docker** (Compose) para MongoDB e LocalStack no desenvolvimento local
- Testes de integração (`yarn test:int`) usam **MongoDB em memória** via `mongodb-memory-server` (`jest/start-integration.ts`); Docker não é necessário para essa suíte

### Primeiros passos

1. Clone e instale:

   ```bash
   yarn install
   ```

2. Suba o MongoDB local (replica set de um nó, necessário para transações):

   ```bash
   docker compose up -d mongodb
   ```

3. Crie um **`.env`** na raiz (`yarn dev` usa `--env-file=.env`):

   | Variável | Descrição |
   |----------|-----------|
   | `DATABASE_URI` | URI do MongoDB (necessária para `databaseSetup`) |
   | `PORT` | Porta HTTP (opcional; padrão **3000** em `src/app.ts`) |
   | `CORS_ALLOWED_ORIGINS` | Origins CORS separadas por vírgula (padrão: `http://localhost:5173`) |
   | `S3_USE_MEMORY` | `true` usa storage de mídia em memória (local sem LocalStack/AWS) |
   | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Credenciais do ADMIN criado por `yarn seed:local` (nunca hardcoded) |

   Exemplo mínimo:

   ```env
   PORT=3000
   DATABASE_URI=mongodb://localhost:27017/gamertrust?replicaSet=rs0
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   S3_USE_MEMORY=true
   ```

4. Suba em desenvolvimento (hot reload com `ts-node-dev`):

   ```bash
   yarn dev
   ```

5. **Health check:** `GET /health`.

Mais detalhe: [docs/pt-BR/getting-started.md](docs/pt-BR/getting-started.md).

### Scripts principais

| Comando | Função |
|---------|--------|
| `yarn dev` | Servidor em TS com reload e `.env` |
| `yarn build` | Compila TypeScript e copia `src/contracts/*.yaml` para `dist/` |
| `yarn start` | `node dist/src/app.js` (após build) |
| `yarn test` | Unitários + integração |
| `yarn test:unit` | Apenas testes unitários |
| `yarn test:int` | Apenas testes de integração |
| `yarn test:coverage` | Cobertura (meta ≥ 80% — ver `AGENTS.md`) |
| `yarn lint` / `yarn lint:fix` | ESLint |
| `yarn prettier` | Prettier em `src/**/*.ts` |
| `yarn clean` | Remove `dist` |
| `yarn seed:local` | Seed local (categoria, produto, listing PUBLISHED, ADMIN). Requer `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` |
| `yarn docs:api` | Gera a doc HTTP bilingue a partir do OpenAPI |

### Arquitetura

Fluxo típico: **HTTP → Controller (application) → Service (domain) → Repositório (contrato no domain, implementação na infraestructure) → Mongo + adapters**.

| Doc | Papel |
|-----|-------|
| [docs/pt-BR/architecture](docs/pt-BR/architecture/overview.md) | Arquitetura para humanos |
| [docs/architecture](docs/architecture/00-overview.md) | Canon GamerTrust (`ARCH-*`, `DEC-*`) |
| [docs/architecture-and-layers.md](docs/architecture-and-layers.md) | Regras de camadas do kit |
| [AGENTS.md](AGENTS.md) | Nomes (`I*`, `IM*`), pastas, checklist de contribuição |

Árvore `src/`:

```text
src/
├── application/controllers/   # Express: rotas e delegação ao service
├── configuration/             # dotenv, factories (DI), env-constants
├── contracts/                 # OpenAPI (service.yaml)
├── domain/                    # Entidades, services, contratos de repositório, Server
├── infraestructure/           # Mongo, repos, adapters, i18n de erros, SQS/SNS, S3
└── __tests__/                 # Unitários e integração
```

Grafia fixa: **`infraestructure`**, **`configuration`**.

### API e OpenAPI

Rotas e payloads devem coincidir com **`src/contracts/service.yaml`**. O servidor valida pedidos e respostas contra essa spec. Ao alterar um endpoint, atualize o YAML, os testes e rode `yarn docs:api`.

Como documentar um endpoint: [docs/pt-BR/contributing.md](docs/pt-BR/contributing.md).

### Licença

Ver o campo `license` em [`package.json`](package.json).

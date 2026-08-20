# Primeiros passos

Como subir o backend GamerTrust localmente. Inglês: [en](../en/getting-started.md).

## Pré-requisitos

- Node.js compatível com este repositório
- Yarn
- Docker Compose (MongoDB em replica set; LocalStack para S3/SQS/SNS se não usar mídia in-memory)

Testes de integração (`yarn test:int`) usam `mongodb-memory-server` e não precisam de Docker.

## Instalar e subir

```bash
yarn install
docker compose up -d mongodb
```

Crie `.env` na raiz (`yarn dev` usa `--env-file=.env`). Nunca faça commit desse arquivo.

| Variável | Papel |
|----------|-------|
| `DATABASE_URI` | URI do Mongo (`databaseSetup`) |
| `PORT` | Porta HTTP (padrão `3000`) |
| `CORS_ALLOWED_ORIGINS` | Origins CORS separadas por vírgula (padrão `http://localhost:5173`) |
| `S3_USE_MEMORY` | `true` para mídia em memória (sem LocalStack/AWS) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | ADMIN criado por `yarn seed:local` |

`.env` mínimo:

```env
PORT=3000
DATABASE_URI=mongodb://localhost:27017/gamertrust?replicaSet=rs0
CORS_ALLOWED_ORIGINS=http://localhost:5173
S3_USE_MEMORY=true
```

```bash
yarn dev
```

Health: `GET /health`.

Seed opcional (categoria, produto, listing PUBLISHED, ADMIN):

```bash
yarn seed:local
```

### Mensageria local

Sem broker, o **dispatch in-process** ainda roda os handlers de domínio depois do persist (padrão). `SqsEventPublisher` fica no-op se não houver `SNS_TOPIC_ARN` / `SQS_QUEUE_URL`.

Para LocalStack (S3 + SQS/SNS):

```bash
docker compose up -d localstack
```

Defina `AWS_ENDPOINT_URL` (LocalStack, em geral `http://localhost:4566`) e `SNS_TOPIC_ARN` ou `SQS_QUEUE_URL`. Para pollar filas neste processo: `SQS_CONSUMERS_ENABLED=true` (aí o dispatch in-process desliga por padrão). Tabela completa: [mensageria](./architecture/messaging.md). Sync vs eventos: [comunicação](./architecture/communication.md).

## Scripts úteis

| Comando | Função |
|---------|--------|
| `yarn dev` | Servidor de desenvolvimento |
| `yarn test` / `yarn test:unit` / `yarn test:int` | Testes |
| `yarn test:coverage` | Cobertura (meta ≥ 80%) |
| `yarn lint` | ESLint |
| `yarn docs:api` | Regenerar [docs da API HTTP](./api/README.md) |

## Próximo

- [Convenções HTTP](./architecture/http-conventions.md) — Bearer, rotas públicas, erros
- [Módulos](./architecture/modules.md)
- [Identidade e Auth](./modules/identity.md) — `POST /auth/register` e `GET /auth/me`

# Getting started

Run the GamerTrust backend locally. Portuguese: [pt-BR](../pt-BR/getting-started.md).

## Prerequisites

- Node.js compatible with this repo
- Yarn
- Docker Compose (MongoDB replica set; LocalStack for S3/SQS/SNS if you are not using in-memory media)

Integration tests (`yarn test:int`) use `mongodb-memory-server` and do not need Docker.

## Install and boot

```bash
yarn install
docker compose up -d mongodb
```

Create `.env` at the repository root (`yarn dev` uses `--env-file=.env`). Never commit it.

| Variable | Role |
|----------|------|
| `DATABASE_URI` | Mongo connection string (`databaseSetup`) |
| `PORT` | HTTP port (default `3000`) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins (default `http://localhost:5173`) |
| `S3_USE_MEMORY` | `true` for in-memory media (no LocalStack/AWS) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | ADMIN created by `yarn seed:local` |

Minimal `.env`:

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

Optional seed (category, product, PUBLISHED listing, ADMIN):

```bash
yarn seed:local
```

### Messaging locally

Without a broker, **in-process dispatch** still runs domain handlers after persist (default). `SqsEventPublisher` no-ops if no `SNS_TOPIC_ARN` / `SQS_QUEUE_URL`.

To use LocalStack (S3 + SQS/SNS):

```bash
docker compose up -d localstack
```

Set `AWS_ENDPOINT_URL` (LocalStack, typically `http://localhost:4566`), then either `SNS_TOPIC_ARN` or `SQS_QUEUE_URL`. To poll queues in this process: `SQS_CONSUMERS_ENABLED=true` (then in-process dispatch defaults to off). Full table: [messaging](./architecture/messaging.md). Sync vs events: [communication](./architecture/communication.md).

## Useful scripts

| Command | Purpose |
|---------|---------|
| `yarn dev` | Development server |
| `yarn test` / `yarn test:unit` / `yarn test:int` | Tests |
| `yarn test:coverage` | Coverage (target ≥ 80%) |
| `yarn lint` | ESLint |
| `yarn docs:api` | Regenerate [HTTP API docs](./api/README.md) |

## Next

- [HTTP conventions](./architecture/http-conventions.md) — Bearer, public routes, errors
- [Modules](./architecture/modules.md)
- [Identity & Auth](./modules/identity.md) — `POST /auth/register` then `GET /auth/me`

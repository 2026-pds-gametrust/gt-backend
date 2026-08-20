# Layers

Where code and rules live. Full kit contract: [docs/architecture-and-layers.md](../../architecture-and-layers.md) and [AGENTS.md](../../../AGENTS.md). Portuguese: [pt-BR](../../pt-BR/architecture/layers.md).

## Map

```text
HTTP → Controller (application)
     → Service (domain)
     → I*Repository* and/or IEventPublisher / I*Client
     → Repository impl + adapters (infraestructure)
     → Mongo / S3 / SNS+SQS
```

After a successful write, the Service may `publish` an `IEventEnvelope`. Handlers in **other modules** are domain `IEventHandler` classes that call **that module’s Service** — never AWS from domain. Detail: [communication](./communication.md), [messaging](./messaging.md).

Composition (DI) is only in `src/configuration/factory/`.

| Layer | Folder | Owns | Must not |
|-------|--------|------|----------|
| Domain | `src/domain/` | Entities, services, `I*` contracts, `IEventPublisher`, per-event producer interfaces, `IEventHandler` | Mongoose, `IM*`, Express `req`, `SNSClient` / `SQSClient` |
| Application | `src/application/` | Thin controllers, `authorizeByGroup`, HTTP status, `handleTranslatedError` | Product 404/409, `*Model`, ownership as “id in the URL”, publishing events |
| Infraestructure | `src/infraestructure/` | `IM*`, schemas, repos, adapters, `SqsEventPublisher` / `SqsEventConsumer`, S3 | Product uniqueness / state machines; deciding *what* to publish |
| Configuration | `src/configuration/` | Env constants, factories (including `factory/messaging/`) | Business rules, scattered `process.env` |
| Contracts | `src/contracts/` | OpenAPI `service.yaml` | — |

## Business rules

- **Entity** (`*ServiceEntity`): local invariants (required field, format).
- **Service**: uniqueness, “not found”, workflows, ownership, idempotency.
- **Repository**: CRUD/query, `null` if missing, `DATABASE_ERROR` on driver failure. Never product 404/409.

## Naming

| Form | Use |
|------|-----|
| `I*` | Domain interfaces |
| `IM*` | Mongo persisted shape (infra only) |
| `E*` | Enums |
| `*ServiceEntity` | Entity with local validation |

A use case is a `*Service` method (e.g. `createListing`), not a `*UseCase` class.

## Tests

Mirror under `src/__tests__/`. Target ≥ 80% coverage (`yarn test:coverage`).

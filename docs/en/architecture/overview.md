# Architecture overview

Human-facing summary of the GamerTrust backend. Normative decisions live in the canon: [docs/architecture/00-overview.md](../../architecture/00-overview.md) (`ARCH-*`, `DEC-*`). Portuguese: [pt-BR](../../pt-BR/architecture/overview.md).

## What this service is

A **modular monolith**: one Express process, one MongoDB database, modules as bounded contexts (`identity`, `catalog`, `listings`, …). Extracting a module later should be an infrastructure change, not a domain rewrite ([ARCH-001](../../architecture/01-modular-monolith.md)).

Phase 1 (Discovery & Trust): identity, catalog, listings, verification, trust, search, favorites, media. Later phases (orders, payments, …) are listed in the [module map](./modules.md) but are not implemented as HTTP in this MVP.

## How to read the docs

| Need | Read |
|------|------|
| Run locally | [Getting started](../getting-started.md) |
| Call the API | [HTTP conventions](./http-conventions.md) then [api/](../api/README.md) |
| Sync vs events | [Communication](./communication.md) |
| SNS/SQS, envelope, handlers | [Messaging](./messaging.md) |
| Implement a feature | [Layers](./layers.md) + [AGENTS.md](../../../AGENTS.md) + canon `ARCH-002`… |
| Cite a decision | [Decision registry](../../architecture/00-overview.md#decision-registry) |

## Stack (as implemented)

- HTTP: Express + Helmet + `express-openapi-validator` against `src/contracts/service.yaml`
- Persistence: MongoDB / Mongoose (replica set locally for transactions)
- AuthN: first-party short-lived access JWT + opaque refresh (not Cognito)
- Messaging: **SNS + SQS** (LocalStack in dev), plus **in-process dispatch** so `yarn dev` without a broker still runs domain handlers. Domain contracts are transport-neutral; concrete files live under `infraestructure`. See [communication](./communication.md) and [messaging](./messaging.md).
- Media: S3 (or in-memory when `S3_USE_MEMORY=true`)

## Folder spelling

Always **`infraestructure`** and **`configuration`**. Do not rename to “infrastructure” / “configurations”.

## Related

- [Layers](./layers.md)
- [Modules](./modules.md)
- [Communication](./communication.md)
- [Messaging](./messaging.md)
- [Security](./security.md)
- Kit layers: [docs/architecture-and-layers.md](../../architecture-and-layers.md)

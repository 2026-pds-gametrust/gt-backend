# GamerTrust backend documentation

REST API for the GamerTrust marketplace (Phase 1 — Discovery & Trust). English is **normative** for identifiers, HTTP paths, and `ARCH-*` / `DEC-*` IDs. Portuguese mirror: [pt-BR](../pt-BR/README.md).

| Start here | |
|------------|--|
| [Getting started](./getting-started.md) | Run the service locally |
| [HTTP conventions](./architecture/http-conventions.md) | Auth, errors, pagination, Product ≠ Listing |
| [Modules](./architecture/modules.md) | Bounded contexts, events, ports |
| [Communication](./architecture/communication.md) | Sync ports vs domain events |
| [Messaging](./architecture/messaging.md) | Envelope, SNS/SQS, handlers |
| [HTTP API](./api/README.md) | Generated endpoint contracts |
| [How to document an endpoint](./contributing.md) | OpenAPI → `yarn docs:api` → DeepWiki |

## Project docs

- [Architecture overview](./architecture/overview.md)
- [Layers](./architecture/layers.md)
- [Module map](./architecture/modules.md)
- [Communication](./architecture/communication.md)
- [HTTP conventions](./architecture/http-conventions.md)
- [Messaging](./architecture/messaging.md)
- [Security](./architecture/security.md)
- [Glossary EN ↔ PT](./architecture/glossary.md)

## Phase 1 modules

| Module | Guide | API |
|--------|-------|-----|
| Identity & Auth | [modules/identity.md](./modules/identity.md) | [api/auth](./api/auth/) · [api/identity](./api/identity/) |
| Catalog | [modules/catalog.md](./modules/catalog.md) | [api/catalog](./api/catalog/) |
| Listings | [modules/listings.md](./modules/listings.md) | [api/listings](./api/listings/) |
| Verification | [modules/verification.md](./modules/verification.md) | [api/verification](./api/verification/) |
| Trust | [modules/trust.md](./modules/trust.md) | [api/trust](./api/trust/) |
| Search | [modules/search.md](./modules/search.md) | [api/search](./api/search/) |
| Favorites | [modules/favorites.md](./modules/favorites.md) | [api/favorites](./api/favorites/) |
| Media | [modules/media.md](./modules/media.md) | [api/media](./api/media/) |

## Other sources

| Kind | Location |
|------|----------|
| Architecture canon (`ARCH-*`, `DEC-*`) | [docs/architecture](../architecture/00-overview.md) |
| Entity catalog | [docs/entities](../entities/INDEX.md) |
| Kit layers | [docs/architecture-and-layers.md](../architecture-and-layers.md) |
| Agent contract | [AGENTS.md](../../AGENTS.md) |
| Documentation hub | [docs/README.md](../README.md) |
| DeepWiki | [deepwiki.com/gametrustt/gt-backend](https://deepwiki.com/gametrustt/gt-backend) · steering [`.devin/wiki.json`](../../.devin/wiki.json) |

## Product rules (non-negotiable)

1. **Trust > volume** — never display a seal or “verified” state unless the API says the process finished.
2. **Product ≠ Listing** — `/products` is the catalog model; `/listings` is the unit for sale.
3. **AI does not invent** — attributes, condition, warranty, and seals come from the API, not from the client filling gaps.
4. **Public signup** is `POST /auth/register`, not `POST /users` (admin-only).

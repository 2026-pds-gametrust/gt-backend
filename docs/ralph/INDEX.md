# Ralph Loops INDEX — Fase 1

> **Entity-first delivery:** Implementation follows [`docs/entities/INDEX.md`](../entities/INDEX.md).  
> First code entity: **`category`**.  
> Legacy module-bundled loops (old 08–57 identity/catalog/…) are **BLOCKED** (superseded).

## Foundation (completed)

| Loop | Título | Status | Ledger |
|------|--------|--------|--------|
| 01 | Architecture gate | COMPLETED | [loop-01-architecture-gate.md](ledgers/loop-01-architecture-gate.md) |
| 01a | Architecture taxonomy delta | COMPLETED | [loop-01a-architecture-taxonomy-delta.md](ledgers/loop-01a-architecture-taxonomy-delta.md) |
| 02 | Ralph scaffold | COMPLETED | [loop-02-ralph-scaffold.md](ledgers/loop-02-ralph-scaffold.md) |
| 03 | Shared kernel | COMPLETED | [loop-03-shared-kernel.md](ledgers/loop-03-shared-kernel.md) |
| 04 | ESLint boundaries | COMPLETED | [loop-04-eslint-boundaries.md](ledgers/loop-04-eslint-boundaries.md) |
| 05 | Messaging contracts | COMPLETED | [loop-05-messaging-contracts.md](ledgers/loop-05-messaging-contracts.md) |
| 06 | SQS infra + LocalStack | COMPLETED | [loop-06-sqs-infra.md](ledgers/loop-06-sqs-infra.md) |
| 07 | Messaging tests | COMPLETED | [loop-07-messaging-tests.md](ledgers/loop-07-messaging-tests.md) |
| EC | Entity catalog docs/entities Fase 1 | COMPLETED | — |

## Entity implementation loops

| Loop | Título | Status | Ledger |
|------|--------|--------|--------|
| E01 | Entity `category` | COMPLETED | [loop-e01-category.md](ledgers/loop-e01-category.md) |
| E02 | Entity `service` | COMPLETED | [loop-e02-service.md](ledgers/loop-e02-service.md) |
| E03 | Entity `user` | COMPLETED | [loop-e03-user.md](ledgers/loop-e03-user.md) |
| E04 | Entity `profile` | COMPLETED | [loop-e04-profile.md](ledgers/loop-e04-profile.md) |
| E05 | Entity `category-attribute-schema` | COMPLETED | [loop-e05-category-attribute-schema.md](ledgers/loop-e05-category-attribute-schema.md) |
| E06 | Entity `product` | COMPLETED | [loop-e06-product.md](ledgers/loop-e06-product.md) |
| E07 | Entity `price-history` | COMPLETED | [loop-e07-price-history.md](ledgers/loop-e07-price-history.md) |
| E08 | Entity `listing` | COMPLETED | [loop-e08-listing.md](ledgers/loop-e08-listing.md) |
| E09 | Entity `listing-event` | COMPLETED | [loop-e09-listing-event.md](ledgers/loop-e09-listing-event.md) |
| E10 | Entity `verification-case` | COMPLETED | [loop-e10-verification-case.md](ledgers/loop-e10-verification-case.md) |
| E11 | Entity `evidence-item` | COMPLETED | [loop-e11-evidence-item.md](ledgers/loop-e11-evidence-item.md) |
| E12 | Entity `seal` | COMPLETED | [loop-e12-seal.md](ledgers/loop-e12-seal.md) |
| E13 | Entity `trust-event` | COMPLETED | [loop-e13-trust-event.md](ledgers/loop-e13-trust-event.md) |
| E14 | Entity `trust-score` | COMPLETED | [loop-e14-trust-score.md](ledgers/loop-e14-trust-score.md) |
| E15 | Entity `seller-level` | COMPLETED | [loop-e15-seller-level.md](ledgers/loop-e15-seller-level.md) |
| E16 | Entity `search-document` | COMPLETED | [loop-e16-search-document.md](ledgers/loop-e16-search-document.md) |
| E17 | Entity `synonym` | COMPLETED | [loop-e17-synonym.md](ledgers/loop-e17-synonym.md) |
| E18 | Entity `query-log` | COMPLETED | [loop-e18-query-log.md](ledgers/loop-e18-query-log.md) |
| E19 | Entity `favorite` | COMPLETED | [loop-e19-favorite.md](ledgers/loop-e19-favorite.md) |
| E20 | Search reconciliation | COMPLETED | [loop-e20-search-reconciliation.md](ledgers/loop-e20-search-reconciliation.md) |
| E21 | Phase 1 integration VERIFY | COMPLETED | [loop-e21-phase1-integration-verify.md](ledgers/loop-e21-phase1-integration-verify.md) |
| E22 | Domain SQS consumers | COMPLETED | [loop-e22-domain-sqs-consumers.md](ledgers/loop-e22-domain-sqs-consumers.md) |
| E23 | Verification auto-publish | COMPLETED | [loop-e23-verification-auto-publish.md](ledgers/loop-e23-verification-auto-publish.md) |
| E24 | ActorContext ownership | COMPLETED | [loop-e24-actor-context-ownership.md](ledgers/loop-e24-actor-context-ownership.md) |
| E25 | Atlas Search lexical (`ISearchEngine`) | COMPLETED | [loop-e25-atlas-search.md](ledgers/loop-e25-atlas-search.md) |
| E26 | Phase 1 hardening VERIFY | COMPLETED | [loop-e26-phase1-hardening-verify.md](ledgers/loop-e26-phase1-hardening-verify.md) |

## Legacy module loops (BLOCKED)

Old identity/catalog/listings waves from the prior Ralph plan are **BLOCKED** and must not resume; use E01+ instead.

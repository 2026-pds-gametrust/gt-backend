# Service taxonomy MVP — Requirements

feature: service-taxonomy-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E02)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Manage unique marketplace service taxonomy with synonyms (DEC-024).

## Scope

- CRUD (create, get by id, list, update name/synonyms/status)
- Uniqueness: slug, name within services; synonym uniqueness across categories ∪ services
- Events: `catalog.service.created`, `catalog.service.updated`
- REST under `/services`

## Out of scope

- Search synonym projection consumer
- Listing/service offering linkage (later entities)

## Acceptance criteria

- AC-01: Duplicate slug or name returns 409
- AC-02: Synonym already used by category or another service returns 409
- AC-03: Get unknown id returns 404
- AC-04: Synonyms stored normalized
- AC-05: Create publishes event via IEventPublisher

## Entity source

docs/entities/service/

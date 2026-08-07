# Category MVP — Requirements

feature: category-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E01)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Manage unique product categories with synonyms for search (DEC-024).

## Scope

- CRUD (create, get by id, list, update status/name/synonyms)
- Uniqueness: slug, name; synonym uniqueness within categories (services check deferred to entity `service` loop)
- Events: `catalog.category.created`, `catalog.category.updated`
- REST under `/categories`

## Out of scope

- Service taxonomy entity
- Search synonym projection consumer
- Attribute schemas

## Acceptance criteria

- AC-01: Creating category with duplicate slug or name returns 409
- AC-02: Creating category with synonym already used by another category returns 409
- AC-03: Get unknown id returns 404
- AC-04: Synonyms stored normalized
- AC-05: Create publishes event via IEventPublisher (spy in tests)

## Entity source

docs/entities/category/

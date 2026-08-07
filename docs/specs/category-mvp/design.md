# Category MVP — Design

feature: category-mvp
status: Approved
version: 0.1.0

## Citations

- ARCH-002 / DEC-024
- docs/entities/category/*

## Placement

| Concern | Layer |
|---------|-------|
| ICategory, entity invariants | domain/catalog |
| Uniqueness, events | CategoryService |
| Mongo categories | infraestructure |
| HTTP | CatalogController `/categories` |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Synonym cross-check vs `services` deferred until service entity implemented |
| D2 | Collection name `categories`; OpenAPI tag Catalog |
| D3 | Publish after persist (Phase 1 DEC-033) |

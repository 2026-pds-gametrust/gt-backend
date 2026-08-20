# Ledger — Loop E02 Entity `service`

status: COMPLETED
completedAt: 2026-08-07

## Delivered

- Domain: IServiceTaxonomy, entity, ServiceTaxonomyService, synonym guard (DEC-024 global)
- Infra: Mongo collection `services`, repos, adapters
- HTTP: `/services` CRUD on CatalogController + OpenAPI
- CategoryService updated for cross-collection synonym uniqueness
- Tests: int service + controller
- Specs: docs/specs/service-taxonomy-mvp/

## Evidence

- yarn test:int (catalog service taxonomy + regression category)

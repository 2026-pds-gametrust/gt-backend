# Service taxonomy MVP — Design

feature: service-taxonomy-mvp
status: Approved

## Placement

| Concern | Layer |
| --- | --- |
| IServiceTaxonomy, ServiceTaxonomyServiceEntity, uniqueness | Domain `catalog` |
| Mongo `services`, adapters, repos | Infraestructure |
| `/services` routes | CatalogController |
| Factories | configuration |

## Cross-cutting

- Shared `assertTaxonomySynonymAvailable` used by CategoryService and ServiceTaxonomyService
- CategoryService now depends on IServiceTaxonomyRepositoryRead for synonym checks

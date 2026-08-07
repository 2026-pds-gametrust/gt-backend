# CategoryAttributeSchema — Interface

## Domain type

`ICategoryAttributeSchema`

Per-category attribute definitions (Mercado Livre–style `/categories/{id}/attributes`): drives listing forms, product specs, and search filters (Pichau facet filters: brand, chipset family, …).

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes | |
| categoryId | string | yes | |
| attributes | IAttributeDef[] | yes | Ordered defs |
| version | number | yes | Bump on breaking schema change |
| createdAt | Date | yes | |
| updatedAt | Date | yes | |

### Nested `IAttributeDef`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| key | string | yes | Stable id (e.g. `vram_gb`, `memory_type`, `BRAND`) |
| name | string | yes | Display label PT/EN per i18n later; store EN key + name |
| valueType | EAttributeType | yes | STRING \| NUMBER \| BOOLEAN \| ENUM |
| required | boolean | yes | ML tag `required` |
| filterable | boolean | yes | Appears as search facet (Pichau filters) |
| facetOn | EAttributeFacetOn | yes | PRODUCT \| LISTING \| BOTH — where value is stored |
| enumValues | string[] | no | When ENUM |
| unit | string | no | e.g. GB, bit, MHz |
| maxLength | number | no | For STRING |
| allowVariations | boolean | no | ML-like; usually false for unique used units |
| group | string | no | e.g. MAIN, TECHNICAL |

## Local invariants (Entity)

- `key` unique within schema
- ENUM requires non-empty `enumValues`
- NUMBER may declare `unit`

## Enums

- `EAttributeType: STRING, NUMBER, BOOLEAN, ENUM`
- `EAttributeFacetOn: PRODUCT, LISTING, BOTH`

## Benchmark notes

- ML: attributes have `value_type`, `tags` (required, fixed, variation), `attribute_group_*`.
- Pichau: category pages expose brand/family filters → `filterable=true` on PRODUCT facet.

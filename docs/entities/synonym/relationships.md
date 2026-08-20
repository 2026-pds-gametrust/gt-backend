# Synonym — Relationships

## References (ids)

| Field | Target entity | Cardinality |
| --- | --- | --- |
| targetId | category|service | 1 |

## Sync ports

_None._

## Domain events

### Publishes

_None._

### Consumes

| Event | Effect |
| --- | --- |
| catalog.category.created/updated | project |
| catalog.service.created/updated | project |

## Read models / projections

- This entity **is** a projection: disposable/rebuildable (DEC-043 / DEC-024).

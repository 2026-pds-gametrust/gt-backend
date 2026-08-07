# Category — Relationships

## References (ids)

| Field | Target entity | Cardinality |
| --- | --- | --- |
| parentId | category | 0..1 |

## Sync ports

| Port / contract | Direction | Peer |
| --- | --- | --- |
| ICatalogClient.getCategory | expose | listings, search |

## Domain events

### Publishes

| Event | Payload facts |
| --- | --- |
| catalog.category.created | id, slug, name, synonyms, status |
| catalog.category.updated | id, changed fields, synonyms |

### Consumes

_None._

## Read models / projections

- Not a read model.

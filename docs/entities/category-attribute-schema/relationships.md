# CategoryAttributeSchema — Relationships

## References (ids)

| Field | Target entity | Cardinality |
| --- | --- | --- |
| categoryId | category | 1 |

## Sync ports

| Port / contract | Direction | Peer |
| --- | --- | --- |
| ICatalogClient.getCategoryAttributes | expose | listings, search |

## Domain events

### Publishes

_None._

### Consumes

_None._

## Read models / projections

- Not a read model.

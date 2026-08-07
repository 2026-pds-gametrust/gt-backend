# Product — Relationships

## References (ids)

| Field | Target entity | Cardinality |
| --- | --- | --- |
| categoryId | category | 1 |

## Sync ports

| Port / contract | Direction | Peer |
| --- | --- | --- |
| ICatalogClient.getProduct | expose | listings, search, pricing |

## Domain events

### Publishes

| Event | Payload facts |
| --- | --- |
| catalog.product.created | productId, categoryId, slug |
| catalog.product.updated | productId, changed fields |

### Consumes

_None._

## Read models / projections

- Not a read model.

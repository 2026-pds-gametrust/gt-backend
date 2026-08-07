# PriceHistory — Relationships

## References (ids)

| Field | Target entity | Cardinality |
| --- | --- | --- |
| productId | product | 1 |

## Sync ports

_None._

## Domain events

### Publishes

_None._

### Consumes

| Event | Effect |
| --- | --- |
| listings.listing.published/sold (P2) | append observation |

## Read models / projections

- Not a read model.

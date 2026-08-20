# Service — Relationships

## References (ids)

_No outbound id references._

## Sync ports

| Port / contract | Direction | Peer |
| --- | --- | --- |
| ICatalogClient.getService | expose | listings, search |

## Domain events

### Publishes

| Event | Payload facts |
| --- | --- |
| catalog.service.created | id, slug, name, synonyms |
| catalog.service.updated | id, changed fields |

### Consumes

_None._

## Read models / projections

- Not a read model.

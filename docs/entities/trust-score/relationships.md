# TrustScore — Relationships

## References (ids)

| Field | Target entity | Cardinality |
| --- | --- | --- |
| sellerId | user | 1 |

## Sync ports

| Port / contract | Direction | Peer |
| --- | --- | --- |
| ITrustClient.getTrustScore | expose | listings, search, orders |

## Domain events

### Publishes

| Event | Payload facts |
| --- | --- |
| trust.score.updated | sellerId, score |

### Consumes

_None._

## Read models / projections

- Not a read model.

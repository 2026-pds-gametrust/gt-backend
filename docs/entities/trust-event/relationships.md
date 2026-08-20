# TrustEvent — Relationships

## References (ids)

| Field | Target entity | Cardinality |
| --- | --- | --- |
| sellerId | user | 1 |

## Sync ports

_None._

## Domain events

### Publishes

_None._

### Consumes

| Event | Effect |
| --- | --- |
| identity.user.verified | append |
| verification.seal.granted/revoked | append |

## Read models / projections

- Not a read model.

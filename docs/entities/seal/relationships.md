# Seal — Relationships

## References (ids)

| Field | Target entity | Cardinality |
| --- | --- | --- |
| listingId | listing | 1 |
| caseId | verification-case | 1 |

## Sync ports

| Port / contract | Direction | Peer |
| --- | --- | --- |
| IVerificationClient.getSeals | expose | listings, search |

## Domain events

### Publishes

| Event | Payload facts |
| --- | --- |
| verification.seal.granted | sealId, listingId, type |
| verification.seal.suspended | … |
| verification.seal.expired | … |
| verification.seal.revoked | … |

### Consumes

_None._

## Read models / projections

- Not a read model.

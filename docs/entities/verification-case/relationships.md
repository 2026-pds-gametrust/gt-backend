# VerificationCase — Relationships

## References (ids)

| Field | Target entity | Cardinality |
| --- | --- | --- |
| listingId | listing | 1 |

## Sync ports

| Port / contract | Direction | Peer |
| --- | --- | --- |
| IListingsClient.getListing | consume | moderation views only |

## Domain events

### Publishes

| Event | Payload facts |
| --- | --- |
| verification.case.submitted | caseId, listingId |
| verification.case.approved | caseId, listingId |
| verification.case.rejected | caseId, listingId, reason |

### Consumes

| Event | Effect |
| --- | --- |
| listings.listing.submitted | create/open case |
| listings.listing.updated | re-verification trigger |

## Read models / projections

- Not a read model.

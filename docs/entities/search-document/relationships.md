# SearchDocument — Relationships

## References (ids)

| Field | Target entity | Cardinality |
| --- | --- | --- |
| listingId | listing | 1 |
| productId | product | 1 |

## Sync ports

| Port / contract | Direction | Peer |
| --- | --- | --- |
| ICatalogClient.getProduct | consume | enrich |
| ITrustClient.getTrustScore | consume | enrich |
| IVerificationClient.getSeals | consume | optional |

## Domain events

### Publishes

| Event | Payload facts |
| --- | --- |
| search.zero-result.recorded | query, filters |

### Consumes

| Event | Effect |
| --- | --- |
| listings.listing.* | upsert/remove |
| catalog.product.updated | re-enrich |
| trust.score.updated | patch score |

## Read models / projections

- This entity **is** a read-model: disposable/rebuildable (DEC-043 / DEC-024).

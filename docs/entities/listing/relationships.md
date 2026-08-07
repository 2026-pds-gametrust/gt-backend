# Listing — Relationships

## References (ids)

| Field | Target entity | Cardinality |
| --- | --- | --- |
| sellerId | user | 1 |
| productId | product | 1 |

## Sync ports

| Port / contract | Direction | Peer |
| --- | --- | --- |
| IListingsClient.getListing | expose | orders, disputes, verification |
| IListingsClient.reserve/release | expose | orders P2 |
| IIdentityClient.getUserSummary | consume |  |
| ICatalogClient.getProduct/getCategoryAttributes | consume |  |
| IVerificationClient.getSeals | consume | render optional |

## Domain events

### Publishes

| Event | Payload facts |
| --- | --- |
| listings.listing.submitted | listingId, productId, sellerId, snapshot attrs |
| listings.listing.published | listingId, … |
| listings.listing.updated | … |
| listings.listing.paused | … |
| listings.listing.expired | … |

### Consumes

| Event | Effect |
| --- | --- |
| verification.case.approved/rejected | publish gate |
| orders.order.cancelled P2 | release |

## Read models / projections

- Not a read model.

# List verified public listings

| | |
|--|--|
| **Domain** | `listings` |
| **OpenAPI tag** | Listings |
| **Method** | `GET` |
| **Path** | `/listings` |
| **Success status** | `200` |
| **Authorization** | Public — no Authorization. Discovery and auth register/login/refresh (not CEP). |

## What this endpoint does

Returns paginated PUBLISHED listings with an active GRANTED seal. Optional sellerId returns an array — owner/backoffice see all statuses for that seller; other callers see only verified listings for that seller.


## Product value

Offer list/feed — main discovery surface.

## How it relates

- `GET /products/{id}` — model (product ≠ offer)
- `POST /listings` → `POST .../submit` → verification → `POST .../publish`
- `GET /seals?listingId=` — seal only if GRANTED
- `GET /trust-scores/{sellerId}` — reasons, not color alone

- Module guide: [listings](../../../../modules/listings.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

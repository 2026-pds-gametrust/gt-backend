# List authenticated seller's own listings

| | |
|--|--|
| **Domain** | `listings` |
| **OpenAPI tag** | Listings |
| **Method** | `GET` |
| **Path** | `/listings/mine` |
| **Success status** | `200` |
| **Authorization** | Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+). |

## What this endpoint does

Seller workspace — own listings with verificationSummary and requiredChanges for corrections.

## Product value

Seller workspace — own listings with verificationSummary and requiredChanges for corrections.

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

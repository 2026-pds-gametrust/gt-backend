# Publish listing (MVP backoffice gate)

| | |
|--|--|
| **Domain** | `listings` |
| **OpenAPI tag** | Listings |
| **Method** | `POST` |
| **Path** | `/listings/{id}/publish` |
| **Success status** | `200` |
| **Authorization** | Bearer + group `backoffice` or `admin` (`authorizeByGroup`). |

## What this endpoint does

Publishes after verification — only then it enters search.

## Product value

Publishes after verification — only then it enters search.

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

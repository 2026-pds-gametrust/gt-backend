# Pause published listing

| | |
|--|--|
| **Domain** | `listings` |
| **OpenAPI tag** | Listings |
| **Method** | `POST` |
| **Path** | `/listings/{id}/pause` |
| **Success status** | `200` |
| **Authorization** | Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+). |

## What this endpoint does

Pauses the offer without deleting history — seller control.

## Product value

Pauses the offer without deleting history — seller control.

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

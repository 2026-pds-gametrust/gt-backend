# Get latest AI validation analysis for a listing

| | |
|--|--|
| **Domain** | `ai` |
| **OpenAPI tag** | AI |
| **Method** | `GET` |
| **Path** | `/listings/{id}/analysis` |
| **Success status** | `200` |
| **Authorization** | Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+). |

## What this endpoint does

Owner and BACKOFFICE/ADMIN only. Returns explainable score and checklist items. Does not include prompt internals or raw media.


## Product value

Supports the GamerTrust experience for this domain.

## How it relates

- `GET /products/{id}` — model (product ≠ offer)
- `POST /listings` → `POST .../submit` → verification → `POST .../publish`
- `GET /seals?listingId=` — seal only if GRANTED
- `GET /trust-scores/{sellerId}` — reasons, not color alone

- Module guide: [ai](../../../../modules/ai.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

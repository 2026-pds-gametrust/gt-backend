# Ensure open case and retrieve possession proof code for a listing

| | |
|--|--|
| **Domain** | `verification` |
| **OpenAPI tag** | Verification |
| **Method** | `GET` |
| **Path** | `/listings/{listingId}/proof-code` |
| **Success status** | `200` |
| **Authorization** | Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+). |

## What this endpoint does

Restricted. Listing owner or BACKOFFICE/ADMIN only.
Opens a PENDING verification case (idempotent) when none exists so the
seller can display the code while capturing draft media, before submit.
Plaintext is never stored at rest.


## Product value

Verification and seals are the trust differentiator. Never show a seal without a completed case.

## How it relates

- `GET /products/{id}` — model (product ≠ offer)
- `POST /listings` → `POST .../submit` → verification → `POST .../publish`
- `GET /seals?listingId=` — seal only if GRANTED
- `GET /trust-scores/{sellerId}` — reasons, not color alone

- Module guide: [verification](../../../../modules/verification.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

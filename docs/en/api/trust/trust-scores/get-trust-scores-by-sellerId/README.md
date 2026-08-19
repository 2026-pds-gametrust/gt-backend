# Get trust score for seller (default 0)

| | |
|--|--|
| **Domain** | `trust` |
| **OpenAPI tag** | Trust |
| **Method** | `GET` |
| **Path** | `/trust-scores/{sellerId}` |
| **Success status** | `200` |
| **Authorization** | Public — no Authorization. Discovery and auth register/login/refresh (not CEP). |

## What this endpoint does

Seller score on the listing page and profile.

## Product value

Seller score on the listing page and profile.

## How it relates

- `GET /listings/{id}` — PDP shows score for `sellerId`
- `GET /seals` — listing seal, not the score
- Never reduce TrustScore to a color without API reasons

- Module guide: [trust](../../../../modules/trust.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

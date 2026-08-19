# Get seller level (default NEW)

| | |
|--|--|
| **Domain** | `trust` |
| **OpenAPI tag** | Trust |
| **Method** | `GET` |
| **Path** | `/seller-levels/{sellerId}` |
| **Success status** | `200` |
| **Authorization** | Public — no Authorization. Discovery and auth register/login/refresh (not CEP). |

## What this endpoint does

Progression level/badge — incentive and social signal.

## Product value

Progression level/badge — incentive and social signal.

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

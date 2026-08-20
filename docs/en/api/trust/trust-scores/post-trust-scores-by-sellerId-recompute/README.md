# Recompute trust score from ledger

| | |
|--|--|
| **Domain** | `trust` |
| **OpenAPI tag** | Trust |
| **Method** | `POST` |
| **Path** | `/trust-scores/{sellerId}/recompute` |
| **Success status** | `200` |
| **Authorization** | Bearer + group `backoffice` or `admin` (`authorizeByGroup`). |

## What this endpoint does

Operational score recompute after events.

## Product value

Operational score recompute after events.

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

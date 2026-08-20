# Reject verification case (backoffice)

| | |
|--|--|
| **Domain** | `verification` |
| **OpenAPI tag** | Verification |
| **Method** | `POST` |
| **Path** | `/verification-cases/{id}/reject` |
| **Success status** | `200` |
| **Authorization** | Bearer + group `backoffice` or `admin` (`authorizeByGroup`). |

## What this endpoint does

Definitive reject — listing becomes REJECTED (terminal); seller cannot resubmit.

## Product value

Definitive reject — listing becomes REJECTED (terminal); seller cannot resubmit.

## How it relates

- `POST /listings/{id}/submit` opens the case
- `POST .../approve` enables publish
- UI: never show a seal without `GRANTED`

- Module guide: [verification](../../../../modules/verification.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

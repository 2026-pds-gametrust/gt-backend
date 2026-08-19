# Get seal by id

| | |
|--|--|
| **Domain** | `verification` |
| **OpenAPI tag** | Verification |
| **Method** | `GET` |
| **Path** | `/seals/{id}` |
| **Success status** | `200` |
| **Authorization** | Public — no Authorization. Discovery and auth register/login/refresh (not CEP). |

## What this endpoint does

Seal detail/explanation in the UI.

## Product value

Seal detail/explanation in the UI.

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

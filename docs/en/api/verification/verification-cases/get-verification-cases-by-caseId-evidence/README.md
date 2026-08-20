# List evidence metadata for a case

| | |
|--|--|
| **Domain** | `verification` |
| **OpenAPI tag** | Verification |
| **Method** | `GET` |
| **Path** | `/verification-cases/{caseId}/evidence` |
| **Success status** | `200` |
| **Authorization** | Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+). |

## What this endpoint does

Requires access token; listing owner or BACKOFFICE/ADMIN.

## Product value

Evidence that supports the seal — auditability.

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

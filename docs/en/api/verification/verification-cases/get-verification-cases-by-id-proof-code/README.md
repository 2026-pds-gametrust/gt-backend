# Retrieve possession proof code plaintext for an open case

| | |
|--|--|
| **Domain** | `verification` |
| **OpenAPI tag** | Verification |
| **Method** | `GET` |
| **Path** | `/verification-cases/{id}/proof-code` |
| **Success status** | `200` |
| **Authorization** | Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+). |

## What this endpoint does

Restricted. Listing owner or BACKOFFICE/ADMIN only.
Plaintext is derived from HMAC(pepper, caseId); never stored at rest.
Public listing/catalog APIs never include this code.


## Product value

Possession code for seller capture / moderator frame check — never on public listing APIs.

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

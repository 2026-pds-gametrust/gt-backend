# Assign user groups (ADMIN only)

| | |
|--|--|
| **Domain** | `identity` |
| **OpenAPI tag** | Users |
| **Method** | `PUT` |
| **Path** | `/users/{id}/groups` |
| **Success status** | `200` |
| **Authorization** | Bearer + group `admin` only. |

## What this endpoint does

ADMIN assigns roles (app-user, backoffice, admin). No self-escalation or SYSTEM.

## Product value

ADMIN assigns roles (app-user, backoffice, admin). No self-escalation or SYSTEM.

## How it relates

- `POST /auth/register` — public signup (do not use POST /users)
- `GET /auth/me` — session User
- `PUT /users/{id}/groups` — roles (ADMIN)

- Module guide: [identity](../../../../modules/identity.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

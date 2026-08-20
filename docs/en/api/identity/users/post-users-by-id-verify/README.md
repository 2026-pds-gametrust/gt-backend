# Verify a user identity

| | |
|--|--|
| **Domain** | `identity` |
| **OpenAPI tag** | Users |
| **Method** | `POST` |
| **Path** | `/users/{id}/verify` |
| **Success status** | `200` |
| **Authorization** | Bearer + group `backoffice` or `admin` (`authorizeByGroup`). |

## What this endpoint does

ADMIN/BACKOFFICE marks identity verified — never fake a listing seal from this flag alone.

## Product value

ADMIN/BACKOFFICE marks identity verified — never fake a listing seal from this flag alone.

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

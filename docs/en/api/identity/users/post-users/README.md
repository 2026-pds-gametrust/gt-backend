# Create a new user

| | |
|--|--|
| **Domain** | `identity` |
| **OpenAPI tag** | Users |
| **Method** | `POST` |
| **Path** | `/users` |
| **Success status** | `201` |
| **Authorization** | Bearer + group `admin` only. |

## What this endpoint does

ADMIN only. Creates a marketplace User without a login credential.

## Product value

ADMIN creates a User without credentials (not public signup). List is BACKOFFICE/ADMIN.

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

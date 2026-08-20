# Update a user

| | |
|--|--|
| **Domain** | `identity` |
| **OpenAPI tag** | Users |
| **Method** | `PUT` |
| **Path** | `/users/{id}` |
| **Success status** | `200` |
| **Authorization** | Bearer + resource owner **or** `admin` (BACKOFFICE is not enough for User PII). |

## What this endpoint does

Update the information of an existing user by ID.

## Product value

PII: GET/PUT/DELETE owner or ADMIN only. Owner PUT does not write verified/status.

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

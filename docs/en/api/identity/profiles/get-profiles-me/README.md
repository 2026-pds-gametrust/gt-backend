# Get authenticated user's own profile (owner projection)

| | |
|--|--|
| **Domain** | `identity` |
| **OpenAPI tag** | Profiles |
| **Method** | `GET` |
| **Path** | `/profiles/me` |
| **Success status** | `200` |
| **Authorization** | Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+). |

## What this endpoint does

Identity and profile anchor ownership, account verification, and addresses — a trust prerequisite. Marketplace User does not store a password; session comes from /auth/*.

## Product value

Identity and profile anchor ownership, account verification, and addresses — a trust prerequisite. Marketplace User does not store a password; session comes from /auth/*.

## How it relates

- `POST /auth/register` — account before profile
- `GET /profiles/by-user/{userId}` — seller page
- `POST /listings` — selling requires account/profile

- Module guide: [identity](../../../../modules/identity.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

# Log in with email and password

| | |
|--|--|
| **Domain** | `auth` |
| **OpenAPI tag** | Auth |
| **Method** | `POST` |
| **Path** | `/auth/login` |
| **Success status** | `200` |
| **Authorization** | Public — no Authorization. Discovery and auth register/login/refresh (not CEP). |

## What this endpoint does

Email+password login. Failure is always 401 AUTH_INVALID_CREDENTIALS (no email enumeration). BLOCKED cannot sign in.

## Product value

Email+password login. Failure is always 401 AUTH_INVALID_CREDENTIALS (no email enumeration). BLOCKED cannot sign in.

## How it relates

- `POST /auth/register` → initial session
- `POST /auth/login` → existing session
- `POST /auth/refresh` → renew access
- `POST /auth/logout` → end session
- `GET /auth/me` → hydrate User
- `POST /profiles` → profile after account
- `POST /listings` → sell (Bearer)

- Module guide: [identity](../../../../modules/identity.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

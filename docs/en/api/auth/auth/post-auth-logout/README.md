# Revoke this session's refresh token and invalidate its access token

| | |
|--|--|
| **Domain** | `auth` |
| **OpenAPI tag** | Auth |
| **Method** | `POST` |
| **Path** | `/auth/logout` |
| **Success status** | `204` |
| **Authorization** | Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+). |

## What this endpoint does

Ends this session: revokes refresh and invalidates the access JWT immediately.

## Product value

Ends this session: revokes refresh and invalidates the access JWT immediately.

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

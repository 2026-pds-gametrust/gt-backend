# Get profile by user id

| | |
|--|--|
| **Domain** | `identity` |
| **OpenAPI tag** | Profiles |
| **Method** | `GET` |
| **Path** | `/profiles/by-user/{userId}` |
| **Success status** | `200` |
| **Authorization** | Public — no Authorization. Discovery and auth register/login/refresh (not CEP). |

## What this endpoint does

Profile lookup by userId — seller page and future checkout.

## Product value

Profile lookup by userId — seller page and future checkout.

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

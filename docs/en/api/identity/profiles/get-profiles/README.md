# List profiles

| | |
|--|--|
| **Domain** | `identity` |
| **OpenAPI tag** | Profiles |
| **Method** | `GET` |
| **Path** | `/profiles` |
| **Success status** | `200` |
| **Authorization** | Bearer + group `backoffice` or `admin` (`authorizeByGroup`). |

## What this endpoint does

Profile and addresses — seller presentation / delivery.

## Product value

Profile and addresses — seller presentation / delivery.

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

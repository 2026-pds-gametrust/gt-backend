# Lookup Brazilian postal code via BrasilAPI

| | |
|--|--|
| **Domain** | `identity` |
| **OpenAPI tag** | CEP |
| **Method** | `GET` |
| **Path** | `/cep/{cep}` |
| **Success status** | `200` |
| **Authorization** | Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+). |

## What this endpoint does

Brazilian postal-code lookup (BrasilAPI) for address forms (Bearer).

## Product value

Brazilian postal-code lookup (BrasilAPI) for address forms (Bearer).

## How it relates

- Use on address forms after `POST /auth/register` (Bearer)
- `POST /profiles` stores the resolved address

- Module guide: [identity](../../../../modules/identity.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

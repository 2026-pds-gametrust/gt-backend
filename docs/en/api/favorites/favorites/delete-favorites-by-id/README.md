# Delete a favorite by id

| | |
|--|--|
| **Domain** | `favorites` |
| **OpenAPI tag** | Favorites |
| **Method** | `DELETE` |
| **Path** | `/favorites/{id}` |
| **Success status** | `204` |
| **Authorization** | Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+). |

## What this endpoint does

Remove a favorite.

## Product value

Remove a favorite.

## How it relates

- Bearer: userId comes from the token, not the body
- `GET /listings/{id}` — favorite destination

- Module guide: [favorites](../../../../modules/favorites.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

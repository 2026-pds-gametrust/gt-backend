# Lexical search over published listing documents

| | |
|--|--|
| **Domain** | `search` |
| **OpenAPI tag** | Search |
| **Method** | `GET` |
| **Path** | `/search` |
| **Success status** | `200` |
| **Authorization** | Public — no Authorization. Discovery and auth register/login/refresh (not CEP). |

## What this endpoint does

Main offer search with query and filters.

## Product value

Main offer search with query and filters.

## How it relates

- `GET /listings/{id}` — offer detail
- `GET /categories` — filters
- Only PUBLISHED listings enter the index

- Module guide: [search](../../../../modules/search.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

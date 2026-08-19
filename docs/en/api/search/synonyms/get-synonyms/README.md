# List synonym projections for expansion

| | |
|--|--|
| **Domain** | `search` |
| **OpenAPI tag** | Search |
| **Method** | `GET` |
| **Path** | `/synonyms` |
| **Success status** | `200` |
| **Authorization** | Public — no Authorization. Discovery and auth register/login/refresh (not CEP). |

## What this endpoint does

Term expansion (e.g. PS5 ↔ PlayStation 5) — fewer zero-results.

## Product value

Term expansion (e.g. PS5 ↔ PlayStation 5) — fewer zero-results.

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

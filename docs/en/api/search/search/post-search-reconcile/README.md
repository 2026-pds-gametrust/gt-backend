# Rebuild search_documents for PUBLISHED listings and synonym projections from taxonomy

| | |
|--|--|
| **Domain** | `search` |
| **OpenAPI tag** | Search |
| **Method** | `POST` |
| **Path** | `/search/reconcile` |
| **Success status** | `200` |
| **Authorization** | Bearer + group `backoffice` or `admin` (`authorizeByGroup`). |

## What this endpoint does

Backoffice-only reconciliation of search read models (DEC-033)

## Product value

Rebuild the search read model — operational consistency.

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

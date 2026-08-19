# Get product by id

| | |
|--|--|
| **Domain** | `catalog` |
| **OpenAPI tag** | Catalog |
| **Method** | `GET` |
| **Path** | `/products/{id}` |
| **Success status** | `200` |
| **Authorization** | Public — no Authorization. Discovery and auth register/login/refresh (not CEP). |

## What this endpoint does

Model sheet for product PDP and deep-links.

## Product value

Model sheet for product PDP and deep-links.

## How it relates

- `GET /categories/{categoryId}/attribute-schema` — listing form
- `POST /listings` uses `productId` (offer ≠ product)
- `GET /search` — public discovery

- Module guide: [catalog](../../../../modules/catalog.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

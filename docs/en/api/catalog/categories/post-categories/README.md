# Create category

| | |
|--|--|
| **Domain** | `catalog` |
| **OpenAPI tag** | Catalog |
| **Method** | `POST` |
| **Path** | `/categories` |
| **Success status** | `201` |
| **Authorization** | Bearer + group `backoffice` or `admin` (`authorizeByGroup`). |

## What this endpoint does

Organizes inventory by type — navigation, chips, and filters.

## Product value

Organizes inventory by type — navigation, chips, and filters.

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

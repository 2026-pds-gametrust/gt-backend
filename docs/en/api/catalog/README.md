# Domain: catalog

## Product value

Catalog is the discovery base: product ≠ offer. Consistent taxonomy enables search, filters, and trustworthy attributes on the client.

## Endpoints (15)

| Method | Path | Summary | Contract |
|--------|------|--------|----------|
| `GET` | `/categories` | List categories | [open](./categories/get-categories/) |
| `POST` | `/categories` | Create category | [open](./categories/post-categories/) |
| `GET` | `/categories/{categoryId}/attribute-schema` | Get category attribute schema | [open](./categories/get-categories-by-categoryId-attribute-schema/) |
| `PUT` | `/categories/{categoryId}/attribute-schema` | Upsert category attribute schema | [open](./categories/put-categories-by-categoryId-attribute-schema/) |
| `GET` | `/categories/{id}` | Get category by id | [open](./categories/get-categories-by-id/) |
| `PUT` | `/categories/{id}` | Update category | [open](./categories/put-categories-by-id/) |
| `GET` | `/products` | List products | [open](./products/get-products/) |
| `POST` | `/products` | Create product | [open](./products/post-products/) |
| `GET` | `/products/{id}` | Get product by id | [open](./products/get-products-by-id/) |
| `PUT` | `/products/{id}` | Update product | [open](./products/put-products-by-id/) |
| `GET` | `/products/{productId}/price-history` | List price history for a product | [open](./products/get-products-by-productId-price-history/) |
| `GET` | `/services` | List taxonomy services | [open](./services/get-services/) |
| `POST` | `/services` | Create taxonomy service | [open](./services/post-services/) |
| `GET` | `/services/{id}` | Get taxonomy service by id | [open](./services/get-services-by-id/) |
| `PUT` | `/services/{id}` | Update taxonomy service | [open](./services/put-services-by-id/) |

## Resources

- [`categories/`](./categories/)
- [`products/`](./products/)
- [`services/`](./services/)

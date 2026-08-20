# Domínio: catalog

## Ganho no produto

Catálogo é a base de descoberta: produto ≠ oferta. Taxonomia consistente habilita busca, filtros e atributos confiáveis no front.

## Endpoints (15)

| Método | Path | Resumo | Contrato |
|--------|------|--------|----------|
| `GET` | `/categories` | List categories | [abrir](./categories/get-categories/) |
| `POST` | `/categories` | Create category | [abrir](./categories/post-categories/) |
| `GET` | `/categories/{categoryId}/attribute-schema` | Get category attribute schema | [abrir](./categories/get-categories-by-categoryId-attribute-schema/) |
| `PUT` | `/categories/{categoryId}/attribute-schema` | Upsert category attribute schema | [abrir](./categories/put-categories-by-categoryId-attribute-schema/) |
| `GET` | `/categories/{id}` | Get category by id | [abrir](./categories/get-categories-by-id/) |
| `PUT` | `/categories/{id}` | Update category | [abrir](./categories/put-categories-by-id/) |
| `GET` | `/products` | List products | [abrir](./products/get-products/) |
| `POST` | `/products` | Create product | [abrir](./products/post-products/) |
| `GET` | `/products/{id}` | Get product by id | [abrir](./products/get-products-by-id/) |
| `PUT` | `/products/{id}` | Update product | [abrir](./products/put-products-by-id/) |
| `GET` | `/products/{productId}/price-history` | List price history for a product | [abrir](./products/get-products-by-productId-price-history/) |
| `GET` | `/services` | List taxonomy services | [abrir](./services/get-services/) |
| `POST` | `/services` | Create taxonomy service | [abrir](./services/post-services/) |
| `GET` | `/services/{id}` | Get taxonomy service by id | [abrir](./services/get-services-by-id/) |
| `PUT` | `/services/{id}` | Update taxonomy service | [abrir](./services/put-services-by-id/) |

## Recursos

- [`categories/`](./categories/)
- [`products/`](./products/)
- [`services/`](./services/)

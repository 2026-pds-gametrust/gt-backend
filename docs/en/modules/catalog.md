# Catalog

Taxonomy and product **models** (not offers). API: [catalog](../api/catalog/). Portuguese: [pt-BR](../../pt-BR/modules/catalog.md).

Entities: [category](../../entities/category/) · [product](../../entities/product/) · [service](../../entities/service/) · [category-attribute-schema](../../entities/category-attribute-schema/) · [price-history](../../entities/price-history/).

## Role

`categories` and `services` are the unique canonical taxonomies (DEC-024). Synonyms on those entities are master data; `search.synonyms` is a projection.

**Product ≠ Listing.** A product is the model (brand, specs). A listing is one used unit for sale.

Writes to taxonomy/products are backoffice/admin. Reads for discovery are public.

## What the client should do

- Drive listing forms from `GET /categories/{categoryId}/attribute-schema` — do not invent attributes.
- Use `GET /products/{id}` for the model PDP; use `/listings` for units.
- `GET /products/{productId}/price-history` is model-level transparency, not the listing price.

## Events

| Event | When | Wired consumer |
|-------|------|----------------|
| `catalog.product.created` / `.updated` | Product write | none yet (search planned) |
| `catalog.category.created` / `.updated` | Category write | search synonym projection |
| `catalog.service.created` / `.updated` | Service taxonomy write | search synonym projection |

Listings attach images through **`IMediaClient`** (sync), not by importing media repositories.

## Related

- [Communication](../architecture/communication.md)
- [Messaging](../architecture/messaging.md)
- API: [catalog](../api/catalog/)

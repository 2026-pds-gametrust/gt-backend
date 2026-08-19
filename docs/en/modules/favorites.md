# Favorites

Saved products or listings. API: [favorites](../api/favorites/). Portuguese: [pt-BR](../../pt-BR/modules/favorites.md).

Entity: [favorite](../../entities/favorite/).

## Role

Re-engagement without fake conversion pressure. `userId` comes from the Bearer token, not from the client body.

Saved searches and price alerts are Phase 2.

## Client rules

- Destination is `GET /listings/{id}` or `GET /products/{id}` depending on what was saved.
- Do not invent “verified” on a favorite card; reuse listing/seal/score from those APIs.

## Events

Publishes `favorites.favorite.created`. No router consumer. Price-drop alerts (Phase 2) will consume `listings.listing.updated` / `published`.

## Related

- [Messaging](../architecture/messaging.md)
- API: [favorites](../api/favorites/)

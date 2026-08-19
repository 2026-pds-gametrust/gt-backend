# Search

Lexical discovery over **published** listings. API: [search](../api/search/). Portuguese: [pt-BR](../../pt-BR/modules/search.md).

Entities: [search-document](../../entities/search-document/) · [synonym](../../entities/synonym/).

## Role

Home entry point. The read model `search_documents` is disposable and rebuildable (DEC-043). Synonym **master data** lives on catalog categories/services; `GET /synonyms` is the operational projection.

## Client rules

- Only `PUBLISHED` listings belong in results.
- Empty results: do not fake listings; use taxonomy / alerts later (Phase 2).
- `POST /search/reconcile` is operational (backoffice), not a user action.

## Events

| Direction | Event | Handler / effect |
|-----------|-------|------------------|
| Consumes | `listings.listing.published` | `reindexListing` |
| Consumes | `listings.listing.paused` | `deleteOnUnpublish` |
| Consumes | `listings.listing.status_changed` | reindex or drop by `toStatus` |
| Consumes | `catalog.category.*` / `catalog.service.*` | synonym projection |
| Publishes | `search.zero-result.recorded` | no router consumer yet (favorites P2) |

`trust.score.updated` is **planned** for search (canon) but not wired in `DomainEventRouterFactory` yet. Rebuild: `POST /search/reconcile`.

## Related

- [Messaging](../architecture/messaging.md) · [Listings](./listings.md) · [Catalog](./catalog.md)
- API: [search](../api/search/)

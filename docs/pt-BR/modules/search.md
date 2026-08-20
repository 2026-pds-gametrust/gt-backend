# Busca

Discovery lexical sobre listings **publicados**. API: [search](../api/search/). Inglês: [en](../../en/modules/search.md).

Entidades: [search-document](../../entities/search-document/) · [synonym](../../entities/synonym/).

## Papel

Entrada da home. O read model `search_documents` é descartável e reconstruível (DEC-043). Master data de sinônimos vive em categories/services do catálogo; `GET /synonyms` é a projeção operacional.

## Regras no cliente

- Só listings `PUBLISHED` entram no resultado.
- Resultado vazio: não inventar anúncios; taxonomia / alertas depois (Fase 2).
- `POST /search/reconcile` é operacional (backoffice), não ação do usuário.

## Eventos

| Direção | Evento | Handler / efeito |
|---------|--------|------------------|
| Consome | `listings.listing.published` | `reindexListing` |
| Consome | `listings.listing.paused` | `deleteOnUnpublish` |
| Consome | `listings.listing.status_changed` | reindex ou drop por `toStatus` |
| Consome | `catalog.category.*` / `catalog.service.*` | projeção de sinônimos |
| Publica | `search.zero-result.recorded` | ainda sem consumer no router (favoritos Fase 2) |

`trust.score.updated` está **planejado** para search (canon) mas ainda não está no `DomainEventRouterFactory`. Rebuild: `POST /search/reconcile`.

## Relacionados

- [Mensageria](../architecture/messaging.md) · [Listings](./listings.md) · [Catálogo](./catalog.md)
- API: [search](../api/search/)

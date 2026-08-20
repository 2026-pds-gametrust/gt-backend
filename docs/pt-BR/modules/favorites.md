# Favoritos

Produtos ou listings salvos. API: [favorites](../api/favorites/). Inglês: [en](../../en/modules/favorites.md).

Entidade: [favorite](../../entities/favorite/).

## Papel

Reengajamento sem pressão falsa de conversão. `userId` vem do Bearer, não do body do cliente.

Pesquisas salvas e alertas de preço são Fase 2.

## Regras no cliente

- Destino é `GET /listings/{id}` ou `GET /products/{id}` conforme o que foi salvo.
- Não inventar “verificado” no card de favorito; reutilize listing/selo/score dessas APIs.

## Eventos

Publica `favorites.favorite.created`. Sem consumer no router. Alertas de preço (Fase 2) devem consumir `listings.listing.updated` / `published`.

## Relacionados

- [Mensageria](../architecture/messaging.md)
- API: [favorites](../api/favorites/)

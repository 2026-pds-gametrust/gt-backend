# Catálogo

Taxonomia e **modelos** de produto (não ofertas). API: [catalog](../api/catalog/). Inglês: [en](../../en/modules/catalog.md).

Entidades: [category](../../entities/category/) · [product](../../entities/product/) · [service](../../entities/service/) · [category-attribute-schema](../../entities/category-attribute-schema/) · [price-history](../../entities/price-history/).

## Papel

`categories` e `services` são as taxonomias canônicas únicas (DEC-024). Sinônimos nessas entidades são master data; `search.synonyms` é projeção.

**Produto ≠ Oferta.** Product é o modelo (marca, specs). Listing é uma unidade usada à venda.

Escritas de taxonomia/produtos são backoffice/admin. Leituras de discovery são públicas.

## O que o cliente deve fazer

- Montar o form de anúncio com `GET /categories/{categoryId}/attribute-schema` — não inventar atributos.
- Usar `GET /products/{id}` na PDP do modelo; `/listings` para unidades.
- `GET /products/{productId}/price-history` é transparência do modelo, não o preço do anúncio.

## Eventos

| Evento | Quando | Consumer ligado |
|--------|--------|-----------------|
| `catalog.product.created` / `.updated` | Write de produto | ainda não (search planejado) |
| `catalog.category.created` / `.updated` | Write de categoria | projeção de sinônimos no search |
| `catalog.service.created` / `.updated` | Write de taxonomia de serviço | projeção de sinônimos no search |

Listings anexam imagens via **`IMediaClient`** (síncrono), sem importar repositórios de media.

## Relacionados

- [Comunicação](../architecture/communication.md)
- [Mensageria](../architecture/messaging.md)
- API: [catalog](../api/catalog/)

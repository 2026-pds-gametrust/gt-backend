# Domínio: search

## Ganho no produto

Busca é a porta de entrada (home dominante). Sinônimos e reconcile mantêm relevância.

## Endpoints (3)

| Método | Path | Resumo | Contrato |
|--------|------|--------|----------|
| `GET` | `/search` | Lexical search over published listing documents | [abrir](./search/get-search/) |
| `POST` | `/search/reconcile` | Rebuild search_documents for PUBLISHED listings and synonym projections from taxonomy | [abrir](./search/post-search-reconcile/) |
| `GET` | `/synonyms` | List synonym projections for expansion | [abrir](./synonyms/get-synonyms/) |

## Recursos

- [`search/`](./search/)
- [`synonyms/`](./synonyms/)

# Rebuild search_documents for PUBLISHED listings and synonym projections from taxonomy

| | |
|--|--|
| **Domínio** | `search` |
| **Tag OpenAPI** | Search |
| **Método** | `POST` |
| **Path** | `/search/reconcile` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer + group `backoffice` ou `admin` (`authorizeByGroup`). |

## O que este endpoint faz

Backoffice-only reconciliation of search read models (DEC-033)

## Ganho no produto

Reindexação do read model — consistência operacional.

## Como se relaciona

- `GET /listings/{id}` — detalhe da oferta
- `GET /categories` — filtros
- Só listings PUBLISHED entram no índice

- Guia do módulo: [search](../../../../modules/search.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

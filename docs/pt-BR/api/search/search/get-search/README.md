# Lexical search over published listing documents

| | |
|--|--|
| **Domínio** | `search` |
| **Tag OpenAPI** | Search |
| **Método** | `GET` |
| **Path** | `/search` |
| **Status sucesso** | `200` |
| **Autorização** | Público — sem Authorization. Discovery e auth register/login/refresh (CEP exige Bearer). |

## O que este endpoint faz

Busca principal de ofertas com query e filtros.

## Ganho no produto

Busca principal de ofertas com query e filtros.

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

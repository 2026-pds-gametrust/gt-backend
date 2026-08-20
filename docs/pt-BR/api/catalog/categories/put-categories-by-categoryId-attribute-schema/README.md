# Upsert category attribute schema

| | |
|--|--|
| **Domínio** | `catalog` |
| **Tag OpenAPI** | Catalog |
| **Método** | `PUT` |
| **Path** | `/categories/{categoryId}/attribute-schema` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer + group `backoffice` ou `admin` (`authorizeByGroup`). |

## O que este endpoint faz

Atributos dinâmicos do formulário de anúncio por categoria — o front não inventa campos.

## Ganho no produto

Atributos dinâmicos do formulário de anúncio por categoria — o front não inventa campos.

## Como se relaciona

- `GET /categories/{categoryId}/attribute-schema` — formulário de anúncio
- `POST /listings` usa `productId` (oferta ≠ produto)
- `GET /search` — discovery pública

- Guia do módulo: [catalog](../../../../modules/catalog.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

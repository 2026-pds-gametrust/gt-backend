# Get category by id

| | |
|--|--|
| **Domínio** | `catalog` |
| **Tag OpenAPI** | Catalog |
| **Método** | `GET` |
| **Path** | `/categories/{id}` |
| **Status sucesso** | `200` |
| **Autorização** | Público — sem Authorization. Discovery e auth register/login/refresh (CEP exige Bearer). |

## O que este endpoint faz

Detalhe canônico da categoria para browse e formulários.

## Ganho no produto

Detalhe canônico da categoria para browse e formulários.

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

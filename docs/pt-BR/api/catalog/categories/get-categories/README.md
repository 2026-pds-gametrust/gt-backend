# List categories

| | |
|--|--|
| **Domínio** | `catalog` |
| **Tag OpenAPI** | Catalog |
| **Método** | `GET` |
| **Path** | `/categories` |
| **Status sucesso** | `200` |
| **Autorização** | Público — sem Authorization. Discovery e auth register/login/refresh (CEP exige Bearer). |

## O que este endpoint faz

Organiza inventário por tipo — navegação, chips e filtros.

## Ganho no produto

Organiza inventário por tipo — navegação, chips e filtros.

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

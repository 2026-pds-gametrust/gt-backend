# List orders for the authenticated buyer or seller

| | |
|--|--|
| **Domínio** | `orders` |
| **Tag OpenAPI** | Orders |
| **Método** | `GET` |
| **Path** | `/orders` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+). |

## O que este endpoint faz

Suporta a experiência GamerTrust alinhada ao domínio.

## Ganho no produto

Suporta a experiência GamerTrust alinhada ao domínio.

## Como se relaciona

- `GET /categories/{categoryId}/attribute-schema` — formulário de anúncio
- `POST /listings` usa `productId` (oferta ≠ produto)
- `GET /search` — discovery pública

- Guia do módulo: [orders](../../../../modules/orders.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

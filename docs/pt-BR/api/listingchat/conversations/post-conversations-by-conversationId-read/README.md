# Mark conversation as read for the actor

| | |
|--|--|
| **Domínio** | `listingchat` |
| **Tag OpenAPI** | ListingChat |
| **Método** | `POST` |
| **Path** | `/conversations/{conversationId}/read` |
| **Status sucesso** | `204` |
| **Autorização** | Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+). |

## O que este endpoint faz

Suporta a experiência GamerTrust alinhada ao domínio.

## Ganho no produto

Suporta a experiência GamerTrust alinhada ao domínio.

## Como se relaciona

- `GET /categories/{categoryId}/attribute-schema` — formulário de anúncio
- `POST /listings` usa `productId` (oferta ≠ produto)
- `GET /search` — discovery pública

- Guia do módulo: [listingchat](../../../../modules/listingchat.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

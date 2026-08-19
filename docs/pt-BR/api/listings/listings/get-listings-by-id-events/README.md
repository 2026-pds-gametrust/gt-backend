# List listing status events

| | |
|--|--|
| **Domínio** | `listings` |
| **Tag OpenAPI** | Listings |
| **Método** | `GET` |
| **Path** | `/listings/{id}/events` |
| **Status sucesso** | `200` |
| **Autorização** | Público — sem Authorization. Discovery e auth register/login/refresh (CEP exige Bearer). |

## O que este endpoint faz

Same visibility rules as GET /listings/{id}. Non-visible listings return 404.


## Ganho no produto

Timeline de estados — transparência da jornada do anúncio.

## Como se relaciona

- `GET /products/{id}` — modelo (produto ≠ oferta)
- `POST /listings` → `POST .../submit` → verificação → `POST .../publish`
- `GET /seals?listingId=` — selo só se GRANTED
- `GET /trust-scores/{sellerId}` — motivos, não só cor

- Guia do módulo: [listings](../../../../modules/listings.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

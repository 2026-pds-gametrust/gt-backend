# Get latest AI validation analysis for a listing

| | |
|--|--|
| **Domínio** | `ai` |
| **Tag OpenAPI** | AI |
| **Método** | `GET` |
| **Path** | `/listings/{id}/analysis` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+). |

## O que este endpoint faz

Owner and BACKOFFICE/ADMIN only. Returns explainable score and checklist items. Does not include prompt internals or raw media.


## Ganho no produto

Suporta a experiência GamerTrust alinhada ao domínio.

## Como se relaciona

- `GET /products/{id}` — modelo (produto ≠ oferta)
- `POST /listings` → `POST .../submit` → verificação → `POST .../publish`
- `GET /seals?listingId=` — selo só se GRANTED
- `GET /trust-scores/{sellerId}` — motivos, não só cor

- Guia do módulo: [ai](../../../../modules/ai.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

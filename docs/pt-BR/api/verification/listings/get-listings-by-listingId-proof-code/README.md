# Ensure open case and retrieve possession proof code for a listing

| | |
|--|--|
| **Domínio** | `verification` |
| **Tag OpenAPI** | Verification |
| **Método** | `GET` |
| **Path** | `/listings/{listingId}/proof-code` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+). |

## O que este endpoint faz

Restricted. Listing owner or BACKOFFICE/ADMIN only.
Opens a PENDING verification case (idempotent) when none exists so the
seller can display the code while capturing draft media, before submit.
Plaintext is never stored at rest.


## Ganho no produto

Verificação e selos são o diferencial de confiança. Nunca exibir selo sem caso concluído.

## Como se relaciona

- `GET /products/{id}` — modelo (produto ≠ oferta)
- `POST /listings` → `POST .../submit` → verificação → `POST .../publish`
- `GET /seals?listingId=` — selo só se GRANTED
- `GET /trust-scores/{sellerId}` — motivos, não só cor

- Guia do módulo: [verification](../../../../modules/verification.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

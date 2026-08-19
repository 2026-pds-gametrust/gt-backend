# Domínio: listings

## Ganho no produto

Listings são ofertas unitárias (oferta ≠ produto). Fluxo draft → submit → verify → publish sustenta confiança > volume.

## Endpoints (9)

| Método | Path | Resumo | Contrato |
|--------|------|--------|----------|
| `GET` | `/listings` | List verified public listings | [abrir](./listings/get-listings/) |
| `POST` | `/listings` | Create listing draft | [abrir](./listings/post-listings/) |
| `GET` | `/listings/{id}` | Get listing by id | [abrir](./listings/get-listings-by-id/) |
| `PUT` | `/listings/{id}` | Update listing | [abrir](./listings/put-listings-by-id/) |
| `GET` | `/listings/{id}/events` | List listing status events | [abrir](./listings/get-listings-by-id-events/) |
| `POST` | `/listings/{id}/pause` | Pause published listing | [abrir](./listings/post-listings-by-id-pause/) |
| `POST` | `/listings/{id}/publish` | Publish listing (MVP backoffice gate) | [abrir](./listings/post-listings-by-id-publish/) |
| `POST` | `/listings/{id}/submit` | Submit listing for verification | [abrir](./listings/post-listings-by-id-submit/) |
| `GET` | `/listings/mine` | List authenticated seller's own listings | [abrir](./listings/get-listings-mine/) |

## Recursos

- [`listings/`](./listings/)

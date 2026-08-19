# Recurso: listings

Domínio: `listings`

| Método | Path | Contrato |
|--------|------|----------|
| `GET` | `/listings` | [List verified public listings](./get-listings/) |
| `POST` | `/listings` | [Create listing draft](./post-listings/) |
| `GET` | `/listings/{id}` | [Get listing by id](./get-listings-by-id/) |
| `PUT` | `/listings/{id}` | [Update listing](./put-listings-by-id/) |
| `GET` | `/listings/{id}/events` | [List listing status events](./get-listings-by-id-events/) |
| `POST` | `/listings/{id}/pause` | [Pause published listing](./post-listings-by-id-pause/) |
| `POST` | `/listings/{id}/publish` | [Publish listing (MVP backoffice gate)](./post-listings-by-id-publish/) |
| `POST` | `/listings/{id}/submit` | [Submit listing for verification](./post-listings-by-id-submit/) |
| `GET` | `/listings/mine` | [List authenticated seller's own listings](./get-listings-mine/) |

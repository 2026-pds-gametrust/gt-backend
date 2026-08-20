# Domain: listings

## Product value

Listings are unit offers (offer ≠ product). Draft → submit → verify → publish keeps trust above volume.

## Endpoints (9)

| Method | Path | Summary | Contract |
|--------|------|--------|----------|
| `GET` | `/listings` | List verified public listings | [open](./listings/get-listings/) |
| `POST` | `/listings` | Create listing draft | [open](./listings/post-listings/) |
| `GET` | `/listings/{id}` | Get listing by id | [open](./listings/get-listings-by-id/) |
| `PUT` | `/listings/{id}` | Update listing | [open](./listings/put-listings-by-id/) |
| `GET` | `/listings/{id}/events` | List listing status events | [open](./listings/get-listings-by-id-events/) |
| `POST` | `/listings/{id}/pause` | Pause published listing | [open](./listings/post-listings-by-id-pause/) |
| `POST` | `/listings/{id}/publish` | Publish listing (MVP backoffice gate) | [open](./listings/post-listings-by-id-publish/) |
| `POST` | `/listings/{id}/submit` | Submit listing for verification | [open](./listings/post-listings-by-id-submit/) |
| `GET` | `/listings/mine` | List authenticated seller's own listings | [open](./listings/get-listings-mine/) |

## Resources

- [`listings/`](./listings/)

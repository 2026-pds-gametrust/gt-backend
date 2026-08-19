# Create listing draft

| | |
|--|--|
| **Domínio** | `listings` |
| **Tag OpenAPI** | Listings |
| **Método** | `POST` |
| **Path** | `/listings` |
| **Status sucesso** | `201` |
| **Autorização** | Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+). |

## O que este endpoint faz

Creates a DRAFT listing. After resolving media assets, at least one public photo and one public video are required (via assetIds/videoAssetId or legacy photoUrls/videoUrl).


## Ganho no produto

Lista/feed de ofertas — superfície principal de descoberta.

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

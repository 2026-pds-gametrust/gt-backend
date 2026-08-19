# Create listing draft

| | |
|--|--|
| **Domain** | `listings` |
| **OpenAPI tag** | Listings |
| **Method** | `POST` |
| **Path** | `/listings` |
| **Success status** | `201` |
| **Authorization** | Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+). |

## What this endpoint does

Creates a DRAFT listing. After resolving media assets, at least one public photo and one public video are required (via assetIds/videoAssetId or legacy photoUrls/videoUrl).


## Product value

Offer list/feed — main discovery surface.

## How it relates

- `GET /products/{id}` — model (product ≠ offer)
- `POST /listings` → `POST .../submit` → verification → `POST .../publish`
- `GET /seals?listingId=` — seal only if GRANTED
- `GET /trust-scores/{sellerId}` — reasons, not color alone

- Module guide: [listings](../../../../modules/listings.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

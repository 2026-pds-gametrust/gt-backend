# Get conversation detail (participant only)

| | |
|--|--|
| **Domain** | `listingchat` |
| **OpenAPI tag** | ListingChat |
| **Method** | `GET` |
| **Path** | `/conversations/{conversationId}` |
| **Success status** | `200` |
| **Authorization** | Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+). |

## What this endpoint does

Supports the GamerTrust experience for this domain.

## Product value

Supports the GamerTrust experience for this domain.

## How it relates

- `GET /categories/{categoryId}/attribute-schema` — listing form
- `POST /listings` uses `productId` (offer ≠ product)
- `GET /search` — public discovery

- Module guide: [listingchat](../../../../modules/listingchat.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

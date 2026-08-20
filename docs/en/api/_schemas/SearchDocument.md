# Schema: SearchDocument

**OpenAPI schema:** `SearchDocument`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `listingId` | string | yes |  |
| `productId` | string | yes |  |
| `categoryId` | string | yes |  |
| `sellerId` | string | yes |  |
| `title` | string | yes |  |
| `brand` | string | no |  |
| `model` | string | no |  |
| `condition` | string | yes |  |
| `status` | string | yes |  |
| `priceCents` | number | yes |  |
| `listPriceCents` | number | no |  |
| `currency` | string | yes |  |
| `locationApprox` | string | no |  |
| `shippingModes` | array<string> | no |  |
| `freeShipping` | boolean | no |  |
| `trustScore` | number | no |  |
| `sellerLevel` | string | no |  |
| `sealTypes` | array<string> | no |  |
| `facets` | object | no |  |
| `searchText` | string | yes |  |
| `thumbnailUrl` | string | no |  |
| `embedding` | array<number> | no |  |
| `sourceOccurredAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "listingId": "string",
  "productId": "string",
  "categoryId": "string",
  "sellerId": "string",
  "title": "string",
  "brand": "string",
  "model": "string",
  "condition": "string",
  "status": "string",
  "priceCents": 0,
  "listPriceCents": 0,
  "currency": "string",
  "locationApprox": "string",
  "shippingModes": [
    "string"
  ],
  "freeShipping": false,
  "trustScore": 0,
  "sellerLevel": "string",
  "sealTypes": [
    "string"
  ],
  "facets": {},
  "searchText": "string",
  "thumbnailUrl": "string",
  "embedding": [
    0
  ],
  "sourceOccurredAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

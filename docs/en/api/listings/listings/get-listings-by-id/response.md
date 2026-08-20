# Response — Get listing by id

**HTTP 200** — Listing found

**OpenAPI schema:** `Listing`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `sellerId` | string | yes |  |
| `productId` | string | yes |  |
| `title` | string | yes |  |
| `description` | string | no |  |
| `condition` | enum(NEW \| LIKE_NEW \| GOOD \| FAIR \| POOR) | yes |  |
| `priceCents` | integer | yes |  |
| `listPriceCents` | integer | no |  |
| `currency` | string | yes |  |
| `attributes` | object | no |  |
| `media` | ListingMedia | yes |  |
| `shipping` | ListingShipping | yes |  |
| `locationApprox` | string | no |  |
| `warranty` | ListingWarranty | no |  |
| `acceptsOffers` | boolean | yes |  |
| `buyNowEnabled` | boolean | yes |  |
| `quantity` | integer | yes |  |
| `status` | enum(DRAFT \| SUBMITTED \| PUBLISHED \| PAUSED \| EXPIRED \| RESERVED \| SOLD \| REJECTED) | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "sellerId": "string",
  "productId": "string",
  "title": "string",
  "description": "string",
  "condition": "NEW",
  "priceCents": 0,
  "listPriceCents": 0,
  "currency": "string",
  "attributes": {},
  "media": {
    "photoUrls": [
      "string"
    ],
    "videoUrl": "string",
    "coverPhotoUrl": "string",
    "assetIds": [
      "string"
    ],
    "videoAssetId": "string"
  },
  "shipping": {
    "modes": [
      "PICKUP"
    ],
    "packageWeightGrams": 0,
    "packageLengthCm": 0,
    "packageWidthCm": 0,
    "packageHeightCm": 0,
    "freeShipping": false
  },
  "locationApprox": "string",
  "warranty": {
    "type": "NONE",
    "months": 0
  },
  "acceptsOffers": false,
  "buyNowEnabled": false,
  "quantity": 0,
  "status": "DRAFT",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **404** — Not found
- **500** — Server error

### HTTP 404

Not found

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / page 404. Do not invent the resource.

### HTTP 500

Server error

**Example:**

```json
{
  "message": "User not found",
  "status": 404,
  "timestamp": "2025-07-15T17:30:00.000Z",
  "path": "/users/123"
}
```

Generic error; do not leak internals.


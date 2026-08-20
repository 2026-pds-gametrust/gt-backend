# Response — Pause published listing

**HTTP 200** — Paused

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

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Actor is not the seller and not backoffice/admin
- **404** — Not found
- **409** — Invalid transition

### HTTP 401

Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Clear the session if access expired; try `POST /auth/refresh`; if that fails, go to login. **Do not** spoof `x-user-id`.

### HTTP 403

Actor is not the seller and not backoffice/admin

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Authenticated user without permission — access-denied message, do not pretend the action succeeded.

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

### HTTP 409

Invalid transition

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Conflict (e.g. illegal state). Show the catalog `code`.


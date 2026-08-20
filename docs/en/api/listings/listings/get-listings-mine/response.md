# Response — List authenticated seller's own listings

**HTTP 200** — Seller inventory page

**OpenAPI schema:** `SellerListingPage`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `items` | array<SellerListing> | yes |  |
| `total` | integer | yes |  |
| `limit` | integer | yes |  |
| `offset` | integer | yes |  |

**Example:**

```json
{
  "items": [
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
          null
        ],
        "videoUrl": "string",
        "coverPhotoUrl": "string",
        "assetIds": [
          null
        ],
        "videoAssetId": "string"
      },
      "shipping": {
        "modes": [
          null
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
      "updatedAt": "2026-08-07T12:00:00.000Z",
      "verificationCase": {
        "id": "string",
        "status": "PENDING",
        "decisionReason": "string",
        "requiredChanges": [
          "..."
        ],
        "previousCaseId": "string",
        "updatedAt": "2026-08-07T12:00:00.000Z"
      }
    }
  ],
  "total": 0,
  "limit": 0,
  "offset": 0
}
```

## Documented errors

- **400** — Invalid filter or pagination
- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **500** — Server error

### HTTP 400

Invalid filter or pagination

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Validation / `USER_UNDERAGE` / `FIELD_INVALID` (duplicate register is also 400). Highlight fields; **do not** treat register 400 as “email already exists” in copy.

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


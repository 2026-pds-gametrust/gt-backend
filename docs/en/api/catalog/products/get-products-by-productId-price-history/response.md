# Response — List price history for a product

**HTTP 200** — Price history list

**Type:** array of `PriceHistory`

**OpenAPI schema:** `PriceHistory`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `productId` | string | yes |  |
| `priceCents` | integer | yes |  |
| `currency` | string | yes |  |
| `source` | enum(LISTING_PUBLISHED \| LISTING_SOLD \| MANUAL) | yes |  |
| `observedAt` | string (date-time) | yes |  |
| `createdAt` | string (date-time) | yes |  |

**Example:**

```json
{
  "id": "string",
  "productId": "string",
  "priceCents": 0,
  "currency": "string",
  "source": "LISTING_PUBLISHED",
  "observedAt": "2026-08-07T12:00:00.000Z",
  "createdAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **404** — Product not found
- **500** — Server error

### HTTP 404

Product not found

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


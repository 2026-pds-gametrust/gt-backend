# Response — List orders for the authenticated buyer or seller

**HTTP 200** — Paginated orders

**OpenAPI schema:** `OrderPage`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `items` | array<Order> | yes |  |
| `page` | integer | yes |  |
| `pageSize` | integer | yes |  |
| `total` | integer | yes |  |

**Example:**

```json
{
  "items": [
    {
      "id": "string",
      "listingId": "string",
      "buyerId": "string",
      "sellerId": "string",
      "shippingMode": "PICKUP",
      "priceCents": 0,
      "currency": "string",
      "status": "AWAITING_PAYMENT",
      "reservationExpiresAt": "2026-08-07T12:00:00.000Z",
      "createdAt": "2026-08-07T12:00:00.000Z",
      "updatedAt": "2026-08-07T12:00:00.000Z"
    }
  ],
  "page": 0,
  "pageSize": 0,
  "total": 0
}
```

## Documented errors

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **500** — Server error

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


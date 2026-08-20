# Response — Create a buy-now order for a published listing

**HTTP 201** — Order created awaiting escrow

**OpenAPI schema:** `Order`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `listingId` | string | yes |  |
| `buyerId` | string | yes |  |
| `sellerId` | string | yes |  |
| `shippingMode` | enum(PICKUP \| SHIPPING) | yes |  |
| `priceCents` | integer | yes |  |
| `currency` | string | yes |  |
| `status` | OrderStatus | yes |  |
| `reservationExpiresAt` | string (date-time) | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
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
```

## Documented errors

- **400** — Validation error
- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Authenticated caller is not in an allowed group
- **404** — Listing or order not found
- **409** — Listing unavailable or already reserved
- **500** — Server error

### HTTP 400

Validation error

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

### HTTP 403

Authenticated caller is not in an allowed group

**Example:**

```json
{
  "error": "Access denied"
}
```

Authenticated user without permission — access-denied message, do not pretend the action succeeded.

### HTTP 404

Listing or order not found

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

Listing unavailable or already reserved

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Conflict (e.g. illegal state). Show the catalog `code`.

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


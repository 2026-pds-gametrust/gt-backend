# Response — Open or resume a conversation for a published listing

**HTTP 201** — Conversation opened or resumed

**OpenAPI schema:** `Conversation`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `listingId` | string | yes |  |
| `buyerId` | string | yes |  |
| `sellerId` | string | yes |  |
| `status` | EConversationStatus | yes |  |
| `buyerUnreadCount` | integer | yes |  |
| `sellerUnreadCount` | integer | yes |  |
| `lastMessageAt` | string (date-time) | no |  |
| `lastMessagePreview` | string | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "listingId": "string",
  "buyerId": "string",
  "sellerId": "string",
  "status": "ACTIVE",
  "buyerUnreadCount": 0,
  "sellerUnreadCount": 0,
  "lastMessageAt": "2026-08-07T12:00:00.000Z",
  "lastMessagePreview": "string",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Not eligible (seller on own listing or listing not published)
- **429** — Rate limit exceeded
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

### HTTP 403

Not eligible (seller on own listing or listing not published)

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Authenticated user without permission — access-denied message, do not pretend the action succeeded.

### HTTP 429

Rate limit exceeded

**Example:**

```json
{
  "error": "Too many requests"
}
```

Throttle: wait and retry with backoff. Do not enumerate identity.

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


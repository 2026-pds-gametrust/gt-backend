# Response — List conversations for the authenticated actor

**HTTP 200** — Paginated conversation summaries

**OpenAPI schema:** `ConversationPage`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `items` | array<ConversationSummary> | yes |  |
| `nextCursor` | string | no |  |

**Example:**

```json
{
  "items": [
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
      "updatedAt": "2026-08-07T12:00:00.000Z",
      "listing": {
        "id": "string",
        "title": "string"
      },
      "otherParticipant": {
        "userId": "string",
        "displayName": "string"
      }
    }
  ],
  "nextCursor": "string"
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


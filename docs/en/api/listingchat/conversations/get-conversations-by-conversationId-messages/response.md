# Response — Paginated message history (participant only)

**HTTP 200** — Message page

**OpenAPI schema:** `MessagePage`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `items` | array<Message> | yes |  |
| `nextCursor` | string | no |  |

**Example:**

```json
{
  "items": [
    {
      "id": "string",
      "conversationId": "string",
      "senderId": "string",
      "body": "string",
      "status": "VISIBLE",
      "createdAt": "2026-08-07T12:00:00.000Z"
    }
  ],
  "nextCursor": "string"
}
```

## Documented errors

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **404** — Resource not found
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

### HTTP 404

Resource not found

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


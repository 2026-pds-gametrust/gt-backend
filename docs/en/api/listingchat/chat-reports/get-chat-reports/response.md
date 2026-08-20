# Response — List chat reports (backoffice/admin)

**HTTP 200** — Paginated chat reports

**OpenAPI schema:** `ChatReportPage`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `items` | array<ChatReport> | yes |  |
| `nextCursor` | string | no |  |

**Example:**

```json
{
  "items": [
    {
      "id": "string",
      "reporterId": "string",
      "targetType": "CONVERSATION",
      "targetId": "string",
      "conversationId": "string",
      "reason": "string",
      "createdAt": "2026-08-07T12:00:00.000Z",
      "updatedAt": "2026-08-07T12:00:00.000Z"
    }
  ],
  "nextCursor": "string"
}
```

## Documented errors

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Authenticated caller is not in an allowed group
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

Authenticated caller is not in an allowed group

**Example:**

```json
{
  "error": "Access denied"
}
```

Authenticated user without permission — access-denied message, do not pretend the action succeeded.

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


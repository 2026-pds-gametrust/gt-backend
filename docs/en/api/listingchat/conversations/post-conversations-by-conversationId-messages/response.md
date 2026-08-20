# Response — Send a text message (participant only)

**HTTP 201** — Message created

**OpenAPI schema:** `Message`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `conversationId` | string | yes |  |
| `senderId` | string | yes |  |
| `body` | string | yes |  |
| `status` | EMessageStatus | yes |  |
| `createdAt` | string (date-time) | yes |  |

**Example:**

```json
{
  "id": "string",
  "conversationId": "string",
  "senderId": "string",
  "body": "string",
  "status": "VISIBLE",
  "createdAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **404** — Resource not found
- **409** — Conversation blocked
- **422** — Invalid or rejected content
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

### HTTP 409

Conversation blocked

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Conflict (e.g. illegal state). Show the catalog `code`.

### HTTP 422

Invalid or rejected content

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Generic error; do not leak internals.

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


# Response — Report a specific message

**HTTP 201** — Report created or updated

**OpenAPI schema:** `ChatReport`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `reporterId` | string | yes |  |
| `targetType` | EChatReportTargetType | yes |  |
| `targetId` | string | yes |  |
| `conversationId` | string | yes |  |
| `reason` | string | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
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
```

## Documented errors

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **404** — Resource not found
- **422** — Request validation failed
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

### HTTP 422

Request validation failed

**Example:**

```json
{
  "message": "Validation failed",
  "status": 400,
  "timestamp": "2025-07-15T17:30:00.000Z",
  "path": "/users",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "value": ""
    }
  ]
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


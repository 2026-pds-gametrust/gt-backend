# Response — Register a marketplace member and issue a session

**HTTP 201** — Registered with access and refresh tokens

**OpenAPI schema:** `AuthSession`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `user` | User | yes |  |
| `accessToken` | string | yes |  |
| `refreshToken` | string | yes |  |

**Example:**

```json
{
  "user": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "cpf": "string",
    "birthDate": "string",
    "verified": false,
    "phoneVerified": false,
    "status": "ACTIVE",
    "createdAt": "2026-08-07T12:00:00.000Z",
    "updatedAt": "2026-08-07T12:00:00.000Z",
    "groups": [
      "app-user"
    ]
  },
  "accessToken": "string",
  "refreshToken": "string"
}
```

## Documented errors

- **400** — Validation error or USER_UNDERAGE / FIELD_INVALID (including duplicate identifier)
- **429** — Auth throttle exhausted — generic limiter body, not an identifier oracle
- **500** — Server error

### HTTP 400

Validation error or USER_UNDERAGE / FIELD_INVALID (including duplicate identifier)

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Validation / `USER_UNDERAGE` / `FIELD_INVALID` (duplicate register is also 400). Highlight fields; **do not** treat register 400 as “email already exists” in copy.

### HTTP 429

Auth throttle exhausted — generic limiter body, not an identifier oracle

**Example:**

```json
{
  "message": "Too many requests, please try again later."
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


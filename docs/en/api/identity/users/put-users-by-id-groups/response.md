# Response — Assign user groups (ADMIN only)

**HTTP 200** — User with updated groups

**OpenAPI schema:** `User`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `fullName` | string | yes |  |
| `email` | string | yes |  |
| `phone` | string | yes |  |
| `cpf` | string | yes | 11 digits; never included in domain events |
| `birthDate` | string (date) | yes | YYYY-MM-DD |
| `verified` | boolean | yes |  |
| `phoneVerified` | boolean | yes |  |
| `status` | enum(ACTIVE \| BLOCKED \| PENDING_VERIFICATION) | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |
| `groups` | array<string> | no | HTTP-assignable groups; empty when unset. Never includes SYSTEM. |

**Example:**

```json
{
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
}
```

## Documented errors

- **400** — FIELD_INVALID (e.g. SYSTEM assignment)
- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Not ADMIN (Access denied), or self-escalation FIELD_INVALID
- **404** — User not found
- **500** — Server error

### HTTP 400

FIELD_INVALID (e.g. SYSTEM assignment)

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

Not ADMIN (Access denied), or self-escalation FIELD_INVALID

**Example:**

```json
{
  "_oneOf": [
    {
      "error": "Access denied"
    },
    {
      "error": "string",
      "code": "RESOURCE_NOT_FOUND",
      "contextInfo": {}
    }
  ]
}
```

Authenticated user without permission — access-denied message, do not pretend the action succeeded.

### HTTP 404

User not found

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


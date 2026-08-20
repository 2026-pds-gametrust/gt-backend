# Response — Upsert category attribute schema

**HTTP 200** — Upserted

**OpenAPI schema:** `CategoryAttributeSchema`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `categoryId` | string | yes |  |
| `attributes` | array<AttributeDef> | yes |  |
| `version` | integer | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "categoryId": "string",
  "attributes": [
    {
      "key": "string",
      "name": "string",
      "valueType": "STRING",
      "required": false,
      "filterable": false,
      "facetOn": "PRODUCT",
      "enumValues": [
        "string"
      ],
      "unit": "string",
      "maxLength": 0,
      "allowVariations": false,
      "group": "string"
    }
  ],
  "version": 0,
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Authenticated caller is not in an allowed group
- **404** — Category not found
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

### HTTP 404

Category not found

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


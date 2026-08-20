# Response — List taxonomy services

**HTTP 200** — Service list

**Type:** array of `ServiceTaxonomy`

**OpenAPI schema:** `ServiceTaxonomy`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `slug` | string | yes |  |
| `name` | string | yes |  |
| `synonyms` | array<string> | yes |  |
| `status` | enum(ACTIVE \| INACTIVE) | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "slug": "string",
  "name": "string",
  "synonyms": [
    "string"
  ],
  "status": "ACTIVE",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **500** — Server error

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


# Response — Get a short-lived content grant

**HTTP 200** — Presigned GET

**OpenAPI schema:** `MediaContentGrant`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `url` | string | yes |  |
| `expiresAt` | string (date-time) | yes |  |

**Example:**

```json
{
  "url": "string",
  "expiresAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **403** — Forbidden
- **404** — Asset not found

### HTTP 403

Forbidden

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Authenticated user without permission — access-denied message, do not pretend the action succeeded.

### HTTP 404

Asset not found

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / page 404. Do not invent the resource.


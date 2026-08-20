# Response — List listing status events

**HTTP 200** — Event ledger

**Type:** array of `ListingEvent`

**OpenAPI schema:** `ListingEvent`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `listingId` | string | yes |  |
| `fromStatus` | enum(DRAFT \| SUBMITTED \| PUBLISHED \| PAUSED \| EXPIRED \| RESERVED \| SOLD \| ) | no |  |
| `toStatus` | enum(DRAFT \| SUBMITTED \| PUBLISHED \| PAUSED \| EXPIRED \| RESERVED \| SOLD \| REJECTED) | yes |  |
| `reason` | string | no |  |
| `actorId` | string | no |  |
| `occurredAt` | string (date-time) | yes |  |

**Example:**

```json
{
  "id": "string",
  "listingId": "string",
  "fromStatus": "DRAFT",
  "toStatus": "DRAFT",
  "reason": "string",
  "actorId": "string",
  "occurredAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **404** — Listing not found
- **500** — Server error

### HTTP 404

Listing not found

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


# Response — Get latest AI validation analysis for a listing

**HTTP 200** — Latest analysis snapshot

**OpenAPI schema:** `ListingAnalysis`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `listingId` | string | yes |  |
| `scope` | enum(DRAFT \| SUBMIT) | yes |  |
| `status` | enum(PENDING \| COMPLETED \| UNAVAILABLE \| FAILED) | yes |  |
| `score` | integer | yes |  |
| `items` | array<AnalysisChecklistItem> | yes |  |
| `modelId` | string | no |  |
| `promptVersion` | string | yes |  |
| `idempotencyKey` | string | yes |  |
| `failureReason` | string | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "listingId": "string",
  "scope": "DRAFT",
  "status": "PENDING",
  "score": 0,
  "items": [
    {
      "id": "string",
      "status": "PASS",
      "weight": 0,
      "reason": "string",
      "evidenceRef": "string"
    }
  ],
  "modelId": "string",
  "promptVersion": "string",
  "idempotencyKey": "string",
  "failureReason": "string",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **404** — Listing or analysis not found
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

Listing or analysis not found

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


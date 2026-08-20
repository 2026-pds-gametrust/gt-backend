# Response — Retrieve possession proof code plaintext for an open case

**HTTP 200** — Possession proof code

**OpenAPI schema:** `ProofCode`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `code` | string | yes | Human-readable possession code (non-ambiguous alphabet) |
| `caseId` | string | yes |  |
| `listingId` | string | yes |  |
| `issuedAt` | string (date-time) | yes |  |

**Example:**

```json
{
  "code": "string",
  "caseId": "string",
  "listingId": "string",
  "issuedAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Forbidden — not listing owner or backoffice
- **404** — Case or listing not found

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

Forbidden — not listing owner or backoffice

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

Case or listing not found

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / page 404. Do not invent the resource.


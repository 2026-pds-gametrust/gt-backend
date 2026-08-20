# Response — List evidence metadata for a case

**HTTP 200** — Evidence list

**Type:** array of `EvidenceItem`

**OpenAPI schema:** `EvidenceItem`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `caseId` | string | yes |  |
| `type` | enum(PHOTO \| VIDEO \| PROOF_CODE_HASH) | yes |  |
| `storageKey` | string | yes |  |
| `assetId` | string | no |  |
| `contentHash` | string | no |  |
| `createdAt` | string (date-time) | yes |  |

**Example:**

```json
{
  "id": "string",
  "caseId": "string",
  "type": "PHOTO",
  "storageKey": "string",
  "assetId": "string",
  "contentHash": "string",
  "createdAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Forbidden
- **404** — Case not found

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

Case not found

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / page 404. Do not invent the resource.


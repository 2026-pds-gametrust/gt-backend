# Response — Request granular listing changes (backoffice)

**HTTP 200** — Changes requested

**OpenAPI schema:** `VerificationCase`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `listingId` | string | yes |  |
| `status` | VerificationCaseStatus | yes |  |
| `checklist` | object | no |  |
| `decisionReason` | string | no |  |
| `moderatorId` | string | no |  |
| `requiredChanges` | array<RequiredChange> | no |  |
| `revisionBaseline` | RevisionBaseline | no |  |
| `previousCaseId` | string | no |  |
| `proofCodeIssuedAt` | string (date-time) | no | When the possession challenge was issued (hash is internal-only) |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "listingId": "string",
  "status": "PENDING",
  "checklist": {},
  "decisionReason": "string",
  "moderatorId": "string",
  "requiredChanges": [
    {
      "target": "PHOTO",
      "reason": "string",
      "assetId": "string",
      "checklistItemId": "string"
    }
  ],
  "revisionBaseline": {
    "assetIds": [
      "string"
    ],
    "videoAssetId": "string",
    "description": "string"
  },
  "previousCaseId": "string",
  "proofCodeIssuedAt": "2026-08-07T12:00:00.000Z",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **400** — Invalid payload or asset reference
- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Forbidden
- **404** — Not found
- **409** — Invalid transition

### HTTP 400

Invalid payload or asset reference

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

Forbidden

**Example:**

```json
{
  "error": "Access denied"
}
```

Authenticated user without permission — access-denied message, do not pretend the action succeeded.

### HTTP 404

Not found

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / page 404. Do not invent the resource.

### HTTP 409

Invalid transition

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Conflict (e.g. illegal state). Show the catalog `code`.


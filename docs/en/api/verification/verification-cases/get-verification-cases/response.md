# Response — List verification cases for moderation

**HTTP 200** — Moderation queue page

**OpenAPI schema:** `ModerationQueuePage`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `items` | array<ModerationQueueItem> | yes |  |
| `total` | integer | yes |  |
| `limit` | integer | yes |  |
| `offset` | integer | yes |  |
| `stats` | ModerationQueueStats | yes |  |

**Example:**

```json
{
  "items": [
    {
      "id": "string",
      "listingId": "string",
      "status": "PENDING",
      "checklist": {},
      "decisionReason": "string",
      "moderatorId": "string",
      "requiredChanges": [
        {
          "target": null,
          "reason": null,
          "assetId": null,
          "checklistItemId": null
        }
      ],
      "revisionBaseline": {
        "assetIds": [
          null
        ],
        "videoAssetId": "string",
        "description": "string"
      },
      "previousCaseId": "string",
      "proofCodeIssuedAt": "2026-08-07T12:00:00.000Z",
      "createdAt": "2026-08-07T12:00:00.000Z",
      "updatedAt": "2026-08-07T12:00:00.000Z",
      "listingTitle": "string",
      "listingStatus": "DRAFT",
      "listingCoverPhotoUrl": "string",
      "sellerId": "string",
      "sellerDisplayName": "string",
      "aiAnalysisScore": 0
    }
  ],
  "total": 0,
  "limit": 0,
  "offset": 0,
  "stats": {
    "total": 0,
    "pending": 0,
    "inReview": 0,
    "approved": 0,
    "changesRequested": 0,
    "rejected": 0
  }
}
```

## Documented errors

- **400** — Invalid query parameter
- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Authenticated caller is not in an allowed group
- **500** — Server error

### HTTP 400

Invalid query parameter

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

Authenticated caller is not in an allowed group

**Example:**

```json
{
  "error": "Access denied"
}
```

Authenticated user without permission — access-denied message, do not pretend the action succeeded.

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


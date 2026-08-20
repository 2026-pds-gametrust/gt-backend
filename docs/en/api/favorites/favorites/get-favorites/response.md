# Response — List favorites for the authenticated actor

**HTTP 200** — Favorites bound to the access-token subject

**Type:** array of `Favorite`

**OpenAPI schema:** `Favorite`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `userId` | string | yes |  |
| `targetType` | enum(PRODUCT \| LISTING) | yes |  |
| `targetId` | string | yes |  |
| `createdAt` | string (date-time) | yes |  |

**Example:**

```json
{
  "id": "string",
  "userId": "string",
  "targetType": "PRODUCT",
  "targetId": "string",
  "createdAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED

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


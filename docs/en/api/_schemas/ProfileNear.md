# Schema: ProfileNear

**OpenAPI schema:** `ProfileNear`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `userId` | string | yes |  |
| `displayName` | string | no |  |
| `bio` | string | no |  |
| `locationApprox` | string | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |
| `distanceMeters` | number | yes |  |

**Example:**

```json
{
  "id": "string",
  "userId": "string",
  "displayName": "string",
  "bio": "string",
  "locationApprox": "string",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z",
  "distanceMeters": 0
}
```

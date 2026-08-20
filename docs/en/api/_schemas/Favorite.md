# Schema: Favorite

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

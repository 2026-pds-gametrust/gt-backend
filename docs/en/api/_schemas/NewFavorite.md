# Schema: NewFavorite

**OpenAPI schema:** `NewFavorite`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `userId` | string | no | Ignored for ownership; userId is taken from x-user-id (ActorContext) |
| `targetType` | enum(PRODUCT \| LISTING) | yes |  |
| `targetId` | string | yes |  |

**Example:**

```json
{
  "id": "string",
  "userId": "string",
  "targetType": "PRODUCT",
  "targetId": "string"
}
```

# Response — Get trust score for seller (default 0)

**HTTP 200** — Score

**OpenAPI schema:** `TrustScore`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `sellerId` | string | yes |  |
| `score` | number | yes |  |
| `components` | object | yes |  |
| `computedAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "sellerId": "string",
  "score": 0,
  "components": {},
  "computedAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

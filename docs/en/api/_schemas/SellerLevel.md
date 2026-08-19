# Schema: SellerLevel

**OpenAPI schema:** `SellerLevel`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `sellerId` | string | yes |  |
| `level` | enum(NEW \| EVOLVING \| TRUSTED \| EXCELLENT) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "sellerId": "string",
  "level": "NEW",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

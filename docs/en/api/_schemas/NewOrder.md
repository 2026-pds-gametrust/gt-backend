# Schema: NewOrder

**OpenAPI schema:** `NewOrder`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | no |  |
| `listingId` | string | yes |  |
| `shippingMode` | enum(PICKUP \| SHIPPING) | yes |  |

**Example:**

```json
{
  "id": "string",
  "listingId": "string",
  "shippingMode": "PICKUP"
}
```

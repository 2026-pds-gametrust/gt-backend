# Schema: PriceHistory

**OpenAPI schema:** `PriceHistory`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `productId` | string | yes |  |
| `priceCents` | integer | yes |  |
| `currency` | string | yes |  |
| `source` | enum(LISTING_PUBLISHED \| LISTING_SOLD \| MANUAL) | yes |  |
| `observedAt` | string (date-time) | yes |  |
| `createdAt` | string (date-time) | yes |  |

**Example:**

```json
{
  "id": "string",
  "productId": "string",
  "priceCents": 0,
  "currency": "string",
  "source": "LISTING_PUBLISHED",
  "observedAt": "2026-08-07T12:00:00.000Z",
  "createdAt": "2026-08-07T12:00:00.000Z"
}
```

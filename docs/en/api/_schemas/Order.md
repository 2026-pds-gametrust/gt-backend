# Schema: Order

**OpenAPI schema:** `Order`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `listingId` | string | yes |  |
| `buyerId` | string | yes |  |
| `sellerId` | string | yes |  |
| `shippingMode` | enum(PICKUP \| SHIPPING) | yes |  |
| `priceCents` | integer | yes |  |
| `currency` | string | yes |  |
| `status` | OrderStatus | yes |  |
| `reservationExpiresAt` | string (date-time) | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "listingId": "string",
  "buyerId": "string",
  "sellerId": "string",
  "shippingMode": "PICKUP",
  "priceCents": 0,
  "currency": "string",
  "status": "AWAITING_PAYMENT",
  "reservationExpiresAt": "2026-08-07T12:00:00.000Z",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

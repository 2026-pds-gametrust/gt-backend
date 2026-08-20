# Schema: OrderPage

**OpenAPI schema:** `OrderPage`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `items` | array<Order> | yes |  |
| `page` | integer | yes |  |
| `pageSize` | integer | yes |  |
| `total` | integer | yes |  |

**Example:**

```json
{
  "items": [
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
  ],
  "page": 0,
  "pageSize": 0,
  "total": 0
}
```

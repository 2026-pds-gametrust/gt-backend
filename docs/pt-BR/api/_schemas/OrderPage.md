# Schema: OrderPage

**Schema OpenAPI:** `OrderPage`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `items` | array<Order> | sim |  |
| `page` | integer | sim |  |
| `pageSize` | integer | sim |  |
| `total` | integer | sim |  |

**Exemplo:**

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

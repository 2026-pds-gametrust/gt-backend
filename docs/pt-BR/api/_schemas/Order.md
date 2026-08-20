# Schema: Order

**Schema OpenAPI:** `Order`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `listingId` | string | sim |  |
| `buyerId` | string | sim |  |
| `sellerId` | string | sim |  |
| `shippingMode` | enum(PICKUP \| SHIPPING) | sim |  |
| `priceCents` | integer | sim |  |
| `currency` | string | sim |  |
| `status` | OrderStatus | sim |  |
| `reservationExpiresAt` | string (date-time) | sim |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

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

# Schema: NewOrder

**Schema OpenAPI:** `NewOrder`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | não |  |
| `listingId` | string | sim |  |
| `shippingMode` | enum(PICKUP \| SHIPPING) | sim |  |

**Exemplo:**

```json
{
  "id": "string",
  "listingId": "string",
  "shippingMode": "PICKUP"
}
```

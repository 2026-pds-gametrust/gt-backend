# Schema: SellerLevel

**Schema OpenAPI:** `SellerLevel`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `sellerId` | string | sim |  |
| `level` | enum(NEW \| EVOLVING \| TRUSTED \| EXCELLENT) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "sellerId": "string",
  "level": "NEW",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

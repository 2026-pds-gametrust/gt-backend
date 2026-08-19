# Contrato de saída — Get trust score for seller (default 0)

**HTTP 200** — Score

**Schema OpenAPI:** `TrustScore`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `sellerId` | string | sim |  |
| `score` | number | sim |  |
| `components` | object | sim |  |
| `computedAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

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

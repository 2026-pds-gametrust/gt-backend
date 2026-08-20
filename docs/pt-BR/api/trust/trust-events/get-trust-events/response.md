# Contrato de saída — List trust events by sellerId

**HTTP 200** — Event ledger

**Tipo:** array de `TrustEvent`

**Schema OpenAPI:** `TrustEvent`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `sellerId` | string | sim |  |
| `type` | enum(USER_VERIFIED \| SEAL_GRANTED \| SEAL_REVOKED \| ORDER_COMPLETED) | sim |  |
| `sourceEventId` | string | sim |  |
| `payload` | object | sim |  |
| `occurredAt` | string (date-time) | sim |  |
| `createdAt` | string (date-time) | sim |  |

**Exemplo:**

```json
{
  "id": "string",
  "sellerId": "string",
  "type": "USER_VERIFIED",
  "sourceEventId": "string",
  "payload": {},
  "occurredAt": "2026-08-07T12:00:00.000Z",
  "createdAt": "2026-08-07T12:00:00.000Z"
}
```

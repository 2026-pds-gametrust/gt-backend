# Schema: Seal

**Schema OpenAPI:** `Seal`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `listingId` | string | sim |  |
| `caseId` | string | sim |  |
| `type` | enum(POSSESSION \| FUNCTIONING \| IDENTITY \| PROTECTED_PURCHASE \| WARRANTY) | sim |  |
| `status` | enum(GRANTED \| SUSPENDED \| EXPIRED \| REVOKED) | sim |  |
| `grantedAt` | string (date-time) | não |  |
| `expiresAt` | string (date-time) | não |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "listingId": "string",
  "caseId": "string",
  "type": "POSSESSION",
  "status": "GRANTED",
  "grantedAt": "2026-08-07T12:00:00.000Z",
  "expiresAt": "2026-08-07T12:00:00.000Z",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

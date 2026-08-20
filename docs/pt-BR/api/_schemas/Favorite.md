# Schema: Favorite

**Schema OpenAPI:** `Favorite`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `userId` | string | sim |  |
| `targetType` | enum(PRODUCT \| LISTING) | sim |  |
| `targetId` | string | sim |  |
| `createdAt` | string (date-time) | sim |  |

**Exemplo:**

```json
{
  "id": "string",
  "userId": "string",
  "targetType": "PRODUCT",
  "targetId": "string",
  "createdAt": "2026-08-07T12:00:00.000Z"
}
```

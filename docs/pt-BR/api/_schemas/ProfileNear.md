# Schema: ProfileNear

**Schema OpenAPI:** `ProfileNear`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `userId` | string | sim |  |
| `displayName` | string | não |  |
| `bio` | string | não |  |
| `locationApprox` | string | não |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |
| `distanceMeters` | number | sim |  |

**Exemplo:**

```json
{
  "id": "string",
  "userId": "string",
  "displayName": "string",
  "bio": "string",
  "locationApprox": "string",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z",
  "distanceMeters": 0
}
```

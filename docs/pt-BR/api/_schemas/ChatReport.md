# Schema: ChatReport

**Schema OpenAPI:** `ChatReport`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `reporterId` | string | sim |  |
| `targetType` | EChatReportTargetType | sim |  |
| `targetId` | string | sim |  |
| `conversationId` | string | sim |  |
| `reason` | string | sim |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "reporterId": "string",
  "targetType": "CONVERSATION",
  "targetId": "string",
  "conversationId": "string",
  "reason": "string",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

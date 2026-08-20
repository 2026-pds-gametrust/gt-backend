# Schema: Message

**Schema OpenAPI:** `Message`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `conversationId` | string | sim |  |
| `senderId` | string | sim |  |
| `body` | string | sim |  |
| `status` | EMessageStatus | sim |  |
| `createdAt` | string (date-time) | sim |  |

**Exemplo:**

```json
{
  "id": "string",
  "conversationId": "string",
  "senderId": "string",
  "body": "string",
  "status": "VISIBLE",
  "createdAt": "2026-08-07T12:00:00.000Z"
}
```

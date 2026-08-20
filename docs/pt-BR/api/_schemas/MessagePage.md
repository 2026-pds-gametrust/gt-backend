# Schema: MessagePage

**Schema OpenAPI:** `MessagePage`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `items` | array<Message> | sim |  |
| `nextCursor` | string | não |  |

**Exemplo:**

```json
{
  "items": [
    {
      "id": "string",
      "conversationId": "string",
      "senderId": "string",
      "body": "string",
      "status": "VISIBLE",
      "createdAt": "2026-08-07T12:00:00.000Z"
    }
  ],
  "nextCursor": "string"
}
```

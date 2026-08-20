# Schema: ChatReportPage

**Schema OpenAPI:** `ChatReportPage`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `items` | array<ChatReport> | sim |  |
| `nextCursor` | string | não |  |

**Exemplo:**

```json
{
  "items": [
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
  ],
  "nextCursor": "string"
}
```

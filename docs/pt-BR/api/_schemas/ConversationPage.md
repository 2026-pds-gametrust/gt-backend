# Schema: ConversationPage

**Schema OpenAPI:** `ConversationPage`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `items` | array<ConversationSummary> | sim |  |
| `nextCursor` | string | não |  |

**Exemplo:**

```json
{
  "items": [
    {
      "id": "string",
      "listingId": "string",
      "buyerId": "string",
      "sellerId": "string",
      "status": "ACTIVE",
      "buyerUnreadCount": 0,
      "sellerUnreadCount": 0,
      "lastMessageAt": "2026-08-07T12:00:00.000Z",
      "lastMessagePreview": "string",
      "createdAt": "2026-08-07T12:00:00.000Z",
      "updatedAt": "2026-08-07T12:00:00.000Z",
      "listing": {
        "id": "string",
        "title": "string"
      },
      "otherParticipant": {
        "userId": "string",
        "displayName": "string"
      }
    }
  ],
  "nextCursor": "string"
}
```

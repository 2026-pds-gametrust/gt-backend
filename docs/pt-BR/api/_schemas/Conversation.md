# Schema: Conversation

**Schema OpenAPI:** `Conversation`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `listingId` | string | sim |  |
| `buyerId` | string | sim |  |
| `sellerId` | string | sim |  |
| `status` | EConversationStatus | sim |  |
| `buyerUnreadCount` | integer | sim |  |
| `sellerUnreadCount` | integer | sim |  |
| `lastMessageAt` | string (date-time) | não |  |
| `lastMessagePreview` | string | não |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
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
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

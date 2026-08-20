# Schema: Conversation

**OpenAPI schema:** `Conversation`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `listingId` | string | yes |  |
| `buyerId` | string | yes |  |
| `sellerId` | string | yes |  |
| `status` | EConversationStatus | yes |  |
| `buyerUnreadCount` | integer | yes |  |
| `sellerUnreadCount` | integer | yes |  |
| `lastMessageAt` | string (date-time) | no |  |
| `lastMessagePreview` | string | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

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

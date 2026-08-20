# Schema: MessagePage

**OpenAPI schema:** `MessagePage`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `items` | array<Message> | yes |  |
| `nextCursor` | string | no |  |

**Example:**

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

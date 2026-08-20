# Schema: Message

**OpenAPI schema:** `Message`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `conversationId` | string | yes |  |
| `senderId` | string | yes |  |
| `body` | string | yes |  |
| `status` | EMessageStatus | yes |  |
| `createdAt` | string (date-time) | yes |  |

**Example:**

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

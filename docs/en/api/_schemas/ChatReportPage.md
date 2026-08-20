# Schema: ChatReportPage

**OpenAPI schema:** `ChatReportPage`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `items` | array<ChatReport> | yes |  |
| `nextCursor` | string | no |  |

**Example:**

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

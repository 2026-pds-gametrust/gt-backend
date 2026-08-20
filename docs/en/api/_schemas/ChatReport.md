# Schema: ChatReport

**OpenAPI schema:** `ChatReport`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `reporterId` | string | yes |  |
| `targetType` | EChatReportTargetType | yes |  |
| `targetId` | string | yes |  |
| `conversationId` | string | yes |  |
| `reason` | string | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

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

# Request — Append trust event (backoffice)

**OpenAPI schema:** `NewTrustEvent`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `sellerId` | string | yes |  |
| `type` | enum(USER_VERIFIED \| SEAL_GRANTED \| SEAL_REVOKED \| ORDER_COMPLETED) | yes |  |
| `sourceEventId` | string | yes |  |
| `payload` | object | yes |  |
| `occurredAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "sellerId": "string",
  "type": "USER_VERIFIED",
  "sourceEventId": "string",
  "payload": {},
  "occurredAt": "2026-08-07T12:00:00.000Z"
}
```

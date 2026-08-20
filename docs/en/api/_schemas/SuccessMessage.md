# Schema: SuccessMessage

**OpenAPI schema:** `SuccessMessage`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `message` | string | yes | Success message |
| `timestamp` | string (date-time) | no | When the operation was completed |

**Example:**

```json
{
  "message": "User deleted successfully",
  "timestamp": "2025-07-15T17:30:00.000Z"
}
```

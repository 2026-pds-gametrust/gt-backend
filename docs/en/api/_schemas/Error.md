# Schema: Error

**OpenAPI schema:** `Error`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `message` | string | yes | Error message describing what went wrong |
| `status` | integer | yes | HTTP status code |
| `timestamp` | string (date-time) | no | When the error occurred |
| `path` | string | no | The API endpoint that generated the error |

**Example:**

```json
{
  "message": "User not found",
  "status": 404,
  "timestamp": "2025-07-15T17:30:00.000Z",
  "path": "/users/123"
}
```

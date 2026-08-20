# Schema: ValidationError

**OpenAPI schema:** `ValidationError`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `message` | string | yes | General validation error message |
| `status` | integer | yes | HTTP status code |
| `timestamp` | string (date-time) | no | When the error occurred |
| `path` | string | no | The API endpoint that generated the error |
| `errors` | array<object> | yes | List of specific validation errors |

**Example:**

```json
{
  "message": "Validation failed",
  "status": 400,
  "timestamp": "2025-07-15T17:30:00.000Z",
  "path": "/users",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "value": ""
    }
  ]
}
```

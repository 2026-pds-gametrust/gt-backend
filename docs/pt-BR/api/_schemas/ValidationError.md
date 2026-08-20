# Schema: ValidationError

**Schema OpenAPI:** `ValidationError`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `message` | string | sim | General validation error message |
| `status` | integer | sim | HTTP status code |
| `timestamp` | string (date-time) | não | When the error occurred |
| `path` | string | não | The API endpoint that generated the error |
| `errors` | array<object> | sim | List of specific validation errors |

**Exemplo:**

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

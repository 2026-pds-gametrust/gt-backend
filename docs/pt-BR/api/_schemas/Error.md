# Schema: Error

**Schema OpenAPI:** `Error`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `message` | string | sim | Error message describing what went wrong |
| `status` | integer | sim | HTTP status code |
| `timestamp` | string (date-time) | não | When the error occurred |
| `path` | string | não | The API endpoint that generated the error |

**Exemplo:**

```json
{
  "message": "User not found",
  "status": 404,
  "timestamp": "2025-07-15T17:30:00.000Z",
  "path": "/users/123"
}
```

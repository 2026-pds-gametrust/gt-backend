# Schema: SuccessMessage

**Schema OpenAPI:** `SuccessMessage`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `message` | string | sim | Success message |
| `timestamp` | string (date-time) | não | When the operation was completed |

**Exemplo:**

```json
{
  "message": "User deleted successfully",
  "timestamp": "2025-07-15T17:30:00.000Z"
}
```

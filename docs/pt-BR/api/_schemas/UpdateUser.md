# Schema: UpdateUser

**Schema OpenAPI:** `UpdateUser`

Owner identity fields. verified, phoneVerified and status are not writable here; use POST /users/{id}/verify (BACKOFFICE/ADMIN).

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `fullName` | string | não |  |
| `email` | string | não |  |
| `phone` | string | não |  |
| `cpf` | string | não |  |
| `birthDate` | string (date) | não |  |

**Exemplo:**

```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "cpf": "string",
  "birthDate": "string"
}
```

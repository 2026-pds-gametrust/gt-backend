# Request — Update a user

**OpenAPI schema:** `UpdateUser`

Owner identity fields. verified, phoneVerified and status are not writable here; use POST /users/{id}/verify (BACKOFFICE/ADMIN).

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `fullName` | string | no |  |
| `email` | string | no |  |
| `phone` | string | no |  |
| `cpf` | string | no |  |
| `birthDate` | string (date) | no |  |

**Example:**

```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "cpf": "string",
  "birthDate": "string"
}
```

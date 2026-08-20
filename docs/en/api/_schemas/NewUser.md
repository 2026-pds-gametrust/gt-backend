# Schema: NewUser

**OpenAPI schema:** `NewUser`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `fullName` | string | yes |  |
| `email` | string | yes |  |
| `phone` | string | yes |  |
| `cpf` | string | yes |  |
| `birthDate` | string (date) | yes |  |
| `verified` | boolean | no |  |
| `phoneVerified` | boolean | no |  |
| `status` | enum(ACTIVE \| BLOCKED \| PENDING_VERIFICATION) | no |  |

**Example:**

```json
{
  "id": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "cpf": "string",
  "birthDate": "string",
  "verified": false,
  "phoneVerified": false,
  "status": "ACTIVE"
}
```

# Schema: User

**OpenAPI schema:** `User`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `fullName` | string | yes |  |
| `email` | string | yes |  |
| `phone` | string | yes |  |
| `cpf` | string | yes | 11 digits; never included in domain events |
| `birthDate` | string (date) | yes | YYYY-MM-DD |
| `verified` | boolean | yes |  |
| `phoneVerified` | boolean | yes |  |
| `status` | enum(ACTIVE \| BLOCKED \| PENDING_VERIFICATION) | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |
| `groups` | array<string> | no | HTTP-assignable groups; empty when unset. Never includes SYSTEM. |

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
  "status": "ACTIVE",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z",
  "groups": [
    "app-user"
  ]
}
```

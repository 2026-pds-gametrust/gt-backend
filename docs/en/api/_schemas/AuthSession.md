# Schema: AuthSession

**OpenAPI schema:** `AuthSession`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `user` | User | yes |  |
| `accessToken` | string | yes |  |
| `refreshToken` | string | yes |  |

**Example:**

```json
{
  "user": {
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
  },
  "accessToken": "string",
  "refreshToken": "string"
}
```

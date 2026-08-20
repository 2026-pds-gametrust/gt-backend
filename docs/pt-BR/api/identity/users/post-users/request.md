# Contrato de entrada — Create a new user

**Schema OpenAPI:** `NewUser`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `fullName` | string | sim |  |
| `email` | string | sim |  |
| `phone` | string | sim |  |
| `cpf` | string | sim |  |
| `birthDate` | string (date) | sim |  |
| `verified` | boolean | não |  |
| `phoneVerified` | boolean | não |  |
| `status` | enum(ACTIVE \| BLOCKED \| PENDING_VERIFICATION) | não |  |

**Exemplo:**

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

# Contrato de entrada — Register a marketplace member and issue a session

**Schema OpenAPI:** `NewAuthRegistration`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `fullName` | string | sim |  |
| `email` | string | sim |  |
| `phone` | string | sim |  |
| `cpf` | string | sim |  |
| `birthDate` | string (date) | sim |  |
| `password` | string (password) | sim |  |

**Exemplo:**

```json
{
  "id": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "cpf": "string",
  "birthDate": "string",
  "password": "string"
}
```

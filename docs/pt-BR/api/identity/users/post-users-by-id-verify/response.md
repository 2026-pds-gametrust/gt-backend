# Contrato de saída — Verify a user identity

**HTTP 200** — User verified

**Schema OpenAPI:** `User`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `fullName` | string | sim |  |
| `email` | string | sim |  |
| `phone` | string | sim |  |
| `cpf` | string | sim | 11 digits; never included in domain events |
| `birthDate` | string (date) | sim | YYYY-MM-DD |
| `verified` | boolean | sim |  |
| `phoneVerified` | boolean | sim |  |
| `status` | enum(ACTIVE \| BLOCKED \| PENDING_VERIFICATION) | sim |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |
| `groups` | array<string> | não | HTTP-assignable groups; empty when unset. Never includes SYSTEM. |

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
  "status": "ACTIVE",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z",
  "groups": [
    "app-user"
  ]
}
```

## Erros documentados

- **401** — Unauthorized
- **403** — Caller is not in an allowed user group
- **404** — User not found
- **500** — Server error

### HTTP 401

Unauthorized

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Limpar sessão se o access expirou; tentar `POST /auth/refresh`; se falhar, ir para login. **Não** spoofar `x-user-id`.

### HTTP 403

Caller is not in an allowed user group

**Exemplo:**

```json
{
  "error": "Access denied"
}
```

Usuário autenticado sem permissão — mensagem de acesso negado, sem fingir que a ação ocorreu.

### HTTP 404

User not found

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / 404 de página. Não inventar recurso.

### HTTP 500

Server error

**Exemplo:**

```json
{
  "message": "User not found",
  "status": 404,
  "timestamp": "2025-07-15T17:30:00.000Z",
  "path": "/users/123"
}
```

Erro genérico; não vazar detalhes internos.


# Contrato de saída — Assign user groups (ADMIN only)

**HTTP 200** — User with updated groups

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

- **400** — FIELD_INVALID (e.g. SYSTEM assignment)
- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Not ADMIN (Access denied), or self-escalation FIELD_INVALID
- **404** — User not found
- **500** — Server error

### HTTP 400

FIELD_INVALID (e.g. SYSTEM assignment)

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Validação / `USER_UNDERAGE` / `FIELD_INVALID` (register duplicado também é 400). Destacar campos; **não** tratar 400 de register como “email já existe” na copy.

### HTTP 401

Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED

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

Not ADMIN (Access denied), or self-escalation FIELD_INVALID

**Exemplo:**

```json
{
  "_oneOf": [
    {
      "error": "Access denied"
    },
    {
      "error": "string",
      "code": "RESOURCE_NOT_FOUND",
      "contextInfo": {}
    }
  ]
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


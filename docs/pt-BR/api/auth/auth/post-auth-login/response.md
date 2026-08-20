# Contrato de saída — Log in with email and password

**HTTP 200** — Session issued

**Schema OpenAPI:** `AuthSession`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `user` | User | sim |  |
| `accessToken` | string | sim |  |
| `refreshToken` | string | sim |  |

**Exemplo:**

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

## Erros documentados

- **401** — AUTH_INVALID_CREDENTIALS (unknown email, wrong password, no credential, or BLOCKED)
- **429** — Auth throttle exhausted — generic limiter body, not an identifier oracle
- **500** — Server error

### HTTP 401

AUTH_INVALID_CREDENTIALS (unknown email, wrong password, no credential, or BLOCKED)

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Limpar sessão se o access expirou; tentar `POST /auth/refresh`; se falhar, ir para login. **Não** spoofar `x-user-id`.

### HTTP 429

Auth throttle exhausted — generic limiter body, not an identifier oracle

**Exemplo:**

```json
{
  "message": "Too many requests, please try again later."
}
```

Throttle: esperar e retry com backoff. Não enumerar identidade.

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


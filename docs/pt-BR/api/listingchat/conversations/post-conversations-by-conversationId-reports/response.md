# Contrato de saída — Report a conversation

**HTTP 201** — Report created or updated

**Schema OpenAPI:** `ChatReport`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `reporterId` | string | sim |  |
| `targetType` | EChatReportTargetType | sim |  |
| `targetId` | string | sim |  |
| `conversationId` | string | sim |  |
| `reason` | string | sim |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "reporterId": "string",
  "targetType": "CONVERSATION",
  "targetId": "string",
  "conversationId": "string",
  "reason": "string",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **404** — Resource not found
- **422** — Request validation failed
- **429** — Rate limit exceeded
- **500** — Server error

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

### HTTP 404

Resource not found

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / 404 de página. Não inventar recurso.

### HTTP 422

Request validation failed

**Exemplo:**

```json
{
  "message": "Validation failed",
  "status": 400,
  "timestamp": "2025-07-15T17:30:00.000Z",
  "path": "/users",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "value": ""
    }
  ]
}
```

Erro genérico; não vazar detalhes internos.

### HTTP 429

Rate limit exceeded

**Exemplo:**

```json
{
  "error": "Too many requests"
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


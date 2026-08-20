# Contrato de saída — Send a text message (participant only)

**HTTP 201** — Message created

**Schema OpenAPI:** `Message`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `conversationId` | string | sim |  |
| `senderId` | string | sim |  |
| `body` | string | sim |  |
| `status` | EMessageStatus | sim |  |
| `createdAt` | string (date-time) | sim |  |

**Exemplo:**

```json
{
  "id": "string",
  "conversationId": "string",
  "senderId": "string",
  "body": "string",
  "status": "VISIBLE",
  "createdAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **404** — Resource not found
- **409** — Conversation blocked
- **422** — Invalid or rejected content
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

### HTTP 409

Conversation blocked

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Conflito (ex.: transição ilegal). Mostrar o `code` do catálogo.

### HTTP 422

Invalid or rejected content

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
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


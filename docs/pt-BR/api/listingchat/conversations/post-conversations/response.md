# Contrato de saída — Open or resume a conversation for a published listing

**HTTP 201** — Conversation opened or resumed

**Schema OpenAPI:** `Conversation`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `listingId` | string | sim |  |
| `buyerId` | string | sim |  |
| `sellerId` | string | sim |  |
| `status` | EConversationStatus | sim |  |
| `buyerUnreadCount` | integer | sim |  |
| `sellerUnreadCount` | integer | sim |  |
| `lastMessageAt` | string (date-time) | não |  |
| `lastMessagePreview` | string | não |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "listingId": "string",
  "buyerId": "string",
  "sellerId": "string",
  "status": "ACTIVE",
  "buyerUnreadCount": 0,
  "sellerUnreadCount": 0,
  "lastMessageAt": "2026-08-07T12:00:00.000Z",
  "lastMessagePreview": "string",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Not eligible (seller on own listing or listing not published)
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

### HTTP 403

Not eligible (seller on own listing or listing not published)

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Usuário autenticado sem permissão — mensagem de acesso negado, sem fingir que a ação ocorreu.

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


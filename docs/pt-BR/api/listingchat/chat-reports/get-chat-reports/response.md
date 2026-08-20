# Contrato de saída — List chat reports (backoffice/admin)

**HTTP 200** — Paginated chat reports

**Schema OpenAPI:** `ChatReportPage`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `items` | array<ChatReport> | sim |  |
| `nextCursor` | string | não |  |

**Exemplo:**

```json
{
  "items": [
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
  ],
  "nextCursor": "string"
}
```

## Erros documentados

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Authenticated caller is not in an allowed group
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

Authenticated caller is not in an allowed group

**Exemplo:**

```json
{
  "error": "Access denied"
}
```

Usuário autenticado sem permissão — mensagem de acesso negado, sem fingir que a ação ocorreu.

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


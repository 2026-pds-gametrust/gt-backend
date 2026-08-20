# Contrato de saída — Append trust event (backoffice)

**HTTP 201** — Created or existing (idempotent)

**Schema OpenAPI:** `TrustEvent`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `sellerId` | string | sim |  |
| `type` | enum(USER_VERIFIED \| SEAL_GRANTED \| SEAL_REVOKED \| ORDER_COMPLETED) | sim |  |
| `sourceEventId` | string | sim |  |
| `payload` | object | sim |  |
| `occurredAt` | string (date-time) | sim |  |
| `createdAt` | string (date-time) | sim |  |

**Exemplo:**

```json
{
  "id": "string",
  "sellerId": "string",
  "type": "USER_VERIFIED",
  "sourceEventId": "string",
  "payload": {},
  "occurredAt": "2026-08-07T12:00:00.000Z",
  "createdAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **400** — Invalid payload
- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Forbidden
- **404** — Not found

### HTTP 400

Invalid payload

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

Forbidden

**Exemplo:**

```json
{
  "error": "Access denied"
}
```

Usuário autenticado sem permissão — mensagem de acesso negado, sem fingir que a ação ocorreu.

### HTTP 404

Not found

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / 404 de página. Não inventar recurso.


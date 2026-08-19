# Contrato de saída — Revoke an active seal (backoffice)

**HTTP 200** — Revoked

**Schema OpenAPI:** `Seal`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `listingId` | string | sim |  |
| `caseId` | string | sim |  |
| `type` | enum(POSSESSION \| FUNCTIONING \| IDENTITY \| PROTECTED_PURCHASE \| WARRANTY) | sim |  |
| `status` | enum(GRANTED \| SUSPENDED \| EXPIRED \| REVOKED) | sim |  |
| `grantedAt` | string (date-time) | não |  |
| `expiresAt` | string (date-time) | não |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "listingId": "string",
  "caseId": "string",
  "type": "POSSESSION",
  "status": "GRANTED",
  "grantedAt": "2026-08-07T12:00:00.000Z",
  "expiresAt": "2026-08-07T12:00:00.000Z",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Forbidden
- **404** — Not found
- **409** — Invalid status

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

### HTTP 409

Invalid status

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Conflito (ex.: transição ilegal). Mostrar o `code` do catálogo.


# Contrato de saída — Retrieve possession proof code plaintext for an open case

**HTTP 200** — Possession proof code

**Schema OpenAPI:** `ProofCode`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `code` | string | sim | Human-readable possession code (non-ambiguous alphabet) |
| `caseId` | string | sim |  |
| `listingId` | string | sim |  |
| `issuedAt` | string (date-time) | sim |  |

**Exemplo:**

```json
{
  "code": "string",
  "caseId": "string",
  "listingId": "string",
  "issuedAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Forbidden — not listing owner or backoffice
- **404** — Case or listing not found

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

Forbidden — not listing owner or backoffice

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Usuário autenticado sem permissão — mensagem de acesso negado, sem fingir que a ação ocorreu.

### HTTP 404

Case or listing not found

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / 404 de página. Não inventar recurso.


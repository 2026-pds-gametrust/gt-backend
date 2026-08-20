# Contrato de saída — List evidence metadata for a case

**HTTP 200** — Evidence list

**Tipo:** array de `EvidenceItem`

**Schema OpenAPI:** `EvidenceItem`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `caseId` | string | sim |  |
| `type` | enum(PHOTO \| VIDEO \| PROOF_CODE_HASH) | sim |  |
| `storageKey` | string | sim |  |
| `assetId` | string | não |  |
| `contentHash` | string | não |  |
| `createdAt` | string (date-time) | sim |  |

**Exemplo:**

```json
{
  "id": "string",
  "caseId": "string",
  "type": "PHOTO",
  "storageKey": "string",
  "assetId": "string",
  "contentHash": "string",
  "createdAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Forbidden
- **404** — Case not found

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
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Usuário autenticado sem permissão — mensagem de acesso negado, sem fingir que a ação ocorreu.

### HTTP 404

Case not found

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / 404 de página. Não inventar recurso.


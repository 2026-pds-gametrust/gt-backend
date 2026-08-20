# Contrato de saída — Rebuild search_documents for PUBLISHED listings and synonym projections from taxonomy

**HTTP 200** — Reconciliation counts

**Schema OpenAPI:** `SearchReconcileResult`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `listingsReindexed` | integer | sim | Count of PUBLISHED listings successfully upserted into search_documents |
| `synonymsUpserted` | integer | sim | Count of taxonomy terms upserted into synonyms projection |

**Exemplo:**

```json
{
  "listingsReindexed": 0,
  "synonymsUpserted": 0
}
```

## Erros documentados

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Authenticated caller is not in an allowed group

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


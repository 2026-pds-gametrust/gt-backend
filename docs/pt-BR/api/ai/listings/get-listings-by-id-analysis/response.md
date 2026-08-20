# Contrato de saída — Get latest AI validation analysis for a listing

**HTTP 200** — Latest analysis snapshot

**Schema OpenAPI:** `ListingAnalysis`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `listingId` | string | sim |  |
| `scope` | enum(DRAFT \| SUBMIT) | sim |  |
| `status` | enum(PENDING \| COMPLETED \| UNAVAILABLE \| FAILED) | sim |  |
| `score` | integer | sim |  |
| `items` | array<AnalysisChecklistItem> | sim |  |
| `modelId` | string | não |  |
| `promptVersion` | string | sim |  |
| `idempotencyKey` | string | sim |  |
| `failureReason` | string | não |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "listingId": "string",
  "scope": "DRAFT",
  "status": "PENDING",
  "score": 0,
  "items": [
    {
      "id": "string",
      "status": "PASS",
      "weight": 0,
      "reason": "string",
      "evidenceRef": "string"
    }
  ],
  "modelId": "string",
  "promptVersion": "string",
  "idempotencyKey": "string",
  "failureReason": "string",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **404** — Listing or analysis not found
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

Listing or analysis not found

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / 404 de página. Não inventar recurso.

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


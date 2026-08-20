# Contrato de saída — List verification cases for moderation

**HTTP 200** — Moderation queue page

**Schema OpenAPI:** `ModerationQueuePage`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `items` | array<ModerationQueueItem> | sim |  |
| `total` | integer | sim |  |
| `limit` | integer | sim |  |
| `offset` | integer | sim |  |
| `stats` | ModerationQueueStats | sim |  |

**Exemplo:**

```json
{
  "items": [
    {
      "id": "string",
      "listingId": "string",
      "status": "PENDING",
      "checklist": {},
      "decisionReason": "string",
      "moderatorId": "string",
      "requiredChanges": [
        {
          "target": null,
          "reason": null,
          "assetId": null,
          "checklistItemId": null
        }
      ],
      "revisionBaseline": {
        "assetIds": [
          null
        ],
        "videoAssetId": "string",
        "description": "string"
      },
      "previousCaseId": "string",
      "proofCodeIssuedAt": "2026-08-07T12:00:00.000Z",
      "createdAt": "2026-08-07T12:00:00.000Z",
      "updatedAt": "2026-08-07T12:00:00.000Z",
      "listingTitle": "string",
      "listingStatus": "DRAFT",
      "listingCoverPhotoUrl": "string",
      "sellerId": "string",
      "sellerDisplayName": "string",
      "aiAnalysisScore": 0
    }
  ],
  "total": 0,
  "limit": 0,
  "offset": 0,
  "stats": {
    "total": 0,
    "pending": 0,
    "inReview": 0,
    "approved": 0,
    "changesRequested": 0,
    "rejected": 0
  }
}
```

## Erros documentados

- **400** — Invalid query parameter
- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Authenticated caller is not in an allowed group
- **500** — Server error

### HTTP 400

Invalid query parameter

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


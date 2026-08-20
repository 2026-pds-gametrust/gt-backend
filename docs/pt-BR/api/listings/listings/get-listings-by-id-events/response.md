# Contrato de saída — List listing status events

**HTTP 200** — Event ledger

**Tipo:** array de `ListingEvent`

**Schema OpenAPI:** `ListingEvent`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `listingId` | string | sim |  |
| `fromStatus` | enum(DRAFT \| SUBMITTED \| PUBLISHED \| PAUSED \| EXPIRED \| RESERVED \| SOLD \| ) | não |  |
| `toStatus` | enum(DRAFT \| SUBMITTED \| PUBLISHED \| PAUSED \| EXPIRED \| RESERVED \| SOLD \| REJECTED) | sim |  |
| `reason` | string | não |  |
| `actorId` | string | não |  |
| `occurredAt` | string (date-time) | sim |  |

**Exemplo:**

```json
{
  "id": "string",
  "listingId": "string",
  "fromStatus": "DRAFT",
  "toStatus": "DRAFT",
  "reason": "string",
  "actorId": "string",
  "occurredAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **404** — Listing not found
- **500** — Server error

### HTTP 404

Listing not found

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


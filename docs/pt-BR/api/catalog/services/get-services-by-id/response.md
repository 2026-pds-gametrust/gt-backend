# Contrato de saída — Get taxonomy service by id

**HTTP 200** — Service found

**Schema OpenAPI:** `ServiceTaxonomy`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `slug` | string | sim |  |
| `name` | string | sim |  |
| `synonyms` | array<string> | sim |  |
| `status` | enum(ACTIVE \| INACTIVE) | sim |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "slug": "string",
  "name": "string",
  "synonyms": [
    "string"
  ],
  "status": "ACTIVE",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **404** — Not found
- **500** — Server error

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


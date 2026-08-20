# Contrato de saída — List categories

**HTTP 200** — Category list

**Tipo:** array de `Category`

**Schema OpenAPI:** `Category`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `slug` | string | sim |  |
| `name` | string | sim |  |
| `synonyms` | array<string> | sim |  |
| `parentId` | string | não |  |
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
  "parentId": "string",
  "status": "ACTIVE",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **500** — Server error

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


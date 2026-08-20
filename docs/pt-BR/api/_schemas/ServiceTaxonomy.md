# Schema: ServiceTaxonomy

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

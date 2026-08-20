# Schema: Synonym

**Schema OpenAPI:** `Synonym`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `normalizedTerm` | string | sim |  |
| `targetType` | enum(CATEGORY \| SERVICE) | sim |  |
| `targetId` | string | sim |  |
| `canonicalName` | string | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "normalizedTerm": "string",
  "targetType": "CATEGORY",
  "targetId": "string",
  "canonicalName": "string",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

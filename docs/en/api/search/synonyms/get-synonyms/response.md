# Response — List synonym projections for expansion

**HTTP 200** — Synonym projections

**Type:** array of `Synonym`

**OpenAPI schema:** `Synonym`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `normalizedTerm` | string | yes |  |
| `targetType` | enum(CATEGORY \| SERVICE) | yes |  |
| `targetId` | string | yes |  |
| `canonicalName` | string | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

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

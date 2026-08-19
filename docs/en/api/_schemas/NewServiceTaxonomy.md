# Schema: NewServiceTaxonomy

**OpenAPI schema:** `NewServiceTaxonomy`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `slug` | string | yes |  |
| `name` | string | yes |  |
| `synonyms` | array<string> | no |  |
| `status` | enum(ACTIVE \| INACTIVE) | no |  |

**Example:**

```json
{
  "id": "string",
  "slug": "string",
  "name": "string",
  "synonyms": [
    "string"
  ],
  "status": "ACTIVE"
}
```

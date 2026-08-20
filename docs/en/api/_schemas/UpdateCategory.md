# Schema: UpdateCategory

**OpenAPI schema:** `UpdateCategory`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `name` | string | no |  |
| `synonyms` | array<string> | no |  |
| `parentId` | string | no |  |
| `status` | enum(ACTIVE \| INACTIVE) | no |  |

**Example:**

```json
{
  "name": "string",
  "synonyms": [
    "string"
  ],
  "parentId": "string",
  "status": "ACTIVE"
}
```

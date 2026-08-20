# Schema: Category

**OpenAPI schema:** `Category`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `slug` | string | yes |  |
| `name` | string | yes |  |
| `synonyms` | array<string> | yes |  |
| `parentId` | string | no |  |
| `status` | enum(ACTIVE \| INACTIVE) | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

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

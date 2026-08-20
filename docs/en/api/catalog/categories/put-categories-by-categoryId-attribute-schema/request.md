# Request — Upsert category attribute schema

**OpenAPI schema:** `UpsertCategoryAttributeSchema`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | no |  |
| `attributes` | array<AttributeDef> | yes |  |

**Example:**

```json
{
  "id": "string",
  "attributes": [
    {
      "key": "string",
      "name": "string",
      "valueType": "STRING",
      "required": false,
      "filterable": false,
      "facetOn": "PRODUCT",
      "enumValues": [
        "string"
      ],
      "unit": "string",
      "maxLength": 0,
      "allowVariations": false,
      "group": "string"
    }
  ]
}
```

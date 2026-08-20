# Schema: AttributeDef

**OpenAPI schema:** `AttributeDef`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `key` | string | yes |  |
| `name` | string | yes |  |
| `valueType` | enum(STRING \| NUMBER \| BOOLEAN \| ENUM) | yes |  |
| `required` | boolean | yes |  |
| `filterable` | boolean | yes |  |
| `facetOn` | enum(PRODUCT \| LISTING \| BOTH) | yes |  |
| `enumValues` | array<string> | no |  |
| `unit` | string | no |  |
| `maxLength` | number | no |  |
| `allowVariations` | boolean | no |  |
| `group` | string | no |  |

**Example:**

```json
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
```

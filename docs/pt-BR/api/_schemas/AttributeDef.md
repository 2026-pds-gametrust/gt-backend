# Schema: AttributeDef

**Schema OpenAPI:** `AttributeDef`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `key` | string | sim |  |
| `name` | string | sim |  |
| `valueType` | enum(STRING \| NUMBER \| BOOLEAN \| ENUM) | sim |  |
| `required` | boolean | sim |  |
| `filterable` | boolean | sim |  |
| `facetOn` | enum(PRODUCT \| LISTING \| BOTH) | sim |  |
| `enumValues` | array<string> | não |  |
| `unit` | string | não |  |
| `maxLength` | number | não |  |
| `allowVariations` | boolean | não |  |
| `group` | string | não |  |

**Exemplo:**

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

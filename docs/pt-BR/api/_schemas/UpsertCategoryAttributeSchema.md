# Schema: UpsertCategoryAttributeSchema

**Schema OpenAPI:** `UpsertCategoryAttributeSchema`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | não |  |
| `attributes` | array<AttributeDef> | sim |  |

**Exemplo:**

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

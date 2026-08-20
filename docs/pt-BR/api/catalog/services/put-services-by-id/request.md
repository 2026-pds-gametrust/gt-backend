# Contrato de entrada — Update taxonomy service

**Schema OpenAPI:** `UpdateServiceTaxonomy`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `name` | string | não |  |
| `synonyms` | array<string> | não |  |
| `status` | enum(ACTIVE \| INACTIVE) | não |  |

**Exemplo:**

```json
{
  "name": "string",
  "synonyms": [
    "string"
  ],
  "status": "ACTIVE"
}
```

# Schema: UpdateProduct

**Schema OpenAPI:** `UpdateProduct`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `brand` | string | não |  |
| `model` | string | não |  |
| `series` | string | não |  |
| `mpn` | string | não |  |
| `ean` | string | não |  |
| `sku` | string | não |  |
| `specs` | object | não |  |
| `imageUrls` | array<string> | não |  |
| `imageAssetIds` | array<string> | não |  |
| `referencePriceCents` | integer | não |  |
| `currency` | string | não |  |
| `status` | enum(ACTIVE \| INACTIVE) | não |  |

**Exemplo:**

```json
{
  "brand": "string",
  "model": "string",
  "series": "string",
  "mpn": "string",
  "ean": "string",
  "sku": "string",
  "specs": {},
  "imageUrls": [
    "string"
  ],
  "imageAssetIds": [
    "string"
  ],
  "referencePriceCents": 0,
  "currency": "string",
  "status": "ACTIVE"
}
```

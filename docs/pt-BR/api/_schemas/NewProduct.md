# Schema: NewProduct

**Schema OpenAPI:** `NewProduct`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `categoryId` | string | sim |  |
| `brand` | string | sim |  |
| `model` | string | sim |  |
| `series` | string | não |  |
| `slug` | string | sim |  |
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
  "id": "string",
  "categoryId": "string",
  "brand": "string",
  "model": "string",
  "series": "string",
  "slug": "string",
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

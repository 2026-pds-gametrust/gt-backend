# Request — Create product

**OpenAPI schema:** `NewProduct`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `categoryId` | string | yes |  |
| `brand` | string | yes |  |
| `model` | string | yes |  |
| `series` | string | no |  |
| `slug` | string | yes |  |
| `mpn` | string | no |  |
| `ean` | string | no |  |
| `sku` | string | no |  |
| `specs` | object | no |  |
| `imageUrls` | array<string> | no |  |
| `imageAssetIds` | array<string> | no |  |
| `referencePriceCents` | integer | no |  |
| `currency` | string | no |  |
| `status` | enum(ACTIVE \| INACTIVE) | no |  |

**Example:**

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

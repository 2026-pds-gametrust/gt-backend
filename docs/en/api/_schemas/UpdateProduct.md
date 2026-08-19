# Schema: UpdateProduct

**OpenAPI schema:** `UpdateProduct`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `brand` | string | no |  |
| `model` | string | no |  |
| `series` | string | no |  |
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

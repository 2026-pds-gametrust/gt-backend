# Contrato de entrada — Update listing

**Schema OpenAPI:** `UpdateListing`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `title` | string | não |  |
| `description` | string | não |  |
| `condition` | enum(NEW \| LIKE_NEW \| GOOD \| FAIR \| POOR) | não |  |
| `priceCents` | integer | não |  |
| `listPriceCents` | integer | não |  |
| `currency` | string | não |  |
| `attributes` | object | não |  |
| `media` | ListingMedia | não |  |
| `shipping` | ListingShipping | não |  |
| `locationApprox` | string | não |  |
| `warranty` | ListingWarranty | não |  |
| `acceptsOffers` | boolean | não |  |
| `buyNowEnabled` | boolean | não |  |

**Exemplo:**

```json
{
  "title": "string",
  "description": "string",
  "condition": "NEW",
  "priceCents": 0,
  "listPriceCents": 0,
  "currency": "string",
  "attributes": {},
  "media": {
    "photoUrls": [
      "string"
    ],
    "videoUrl": "string",
    "coverPhotoUrl": "string",
    "assetIds": [
      "string"
    ],
    "videoAssetId": "string"
  },
  "shipping": {
    "modes": [
      "PICKUP"
    ],
    "packageWeightGrams": 0,
    "packageLengthCm": 0,
    "packageWidthCm": 0,
    "packageHeightCm": 0,
    "freeShipping": false
  },
  "locationApprox": "string",
  "warranty": {
    "type": "NONE",
    "months": 0
  },
  "acceptsOffers": false,
  "buyNowEnabled": false
}
```

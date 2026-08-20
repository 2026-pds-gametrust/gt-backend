# Schema: NewListing

**Schema OpenAPI:** `NewListing`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `sellerId` | string | sim |  |
| `productId` | string | sim |  |
| `title` | string | sim |  |
| `description` | string | não |  |
| `condition` | enum(NEW \| LIKE_NEW \| GOOD \| FAIR \| POOR) | sim |  |
| `priceCents` | integer | sim |  |
| `listPriceCents` | integer | não |  |
| `currency` | string | não |  |
| `attributes` | object | não |  |
| `media` | ListingMedia | sim |  |
| `shipping` | ListingShipping | sim |  |
| `locationApprox` | string | não |  |
| `warranty` | ListingWarranty | não |  |
| `acceptsOffers` | boolean | não |  |
| `buyNowEnabled` | boolean | não |  |
| `quantity` | integer | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "sellerId": "string",
  "productId": "string",
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
  "buyNowEnabled": false,
  "quantity": 0
}
```

# Request — Create listing draft

**OpenAPI schema:** `NewListing`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `sellerId` | string | yes |  |
| `productId` | string | yes |  |
| `title` | string | yes |  |
| `description` | string | no |  |
| `condition` | enum(NEW \| LIKE_NEW \| GOOD \| FAIR \| POOR) | yes |  |
| `priceCents` | integer | yes |  |
| `listPriceCents` | integer | no |  |
| `currency` | string | no |  |
| `attributes` | object | no |  |
| `media` | ListingMedia | yes |  |
| `shipping` | ListingShipping | yes |  |
| `locationApprox` | string | no |  |
| `warranty` | ListingWarranty | no |  |
| `acceptsOffers` | boolean | no |  |
| `buyNowEnabled` | boolean | no |  |
| `quantity` | integer | no |  |

**Example:**

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

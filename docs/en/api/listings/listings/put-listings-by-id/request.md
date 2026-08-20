# Request — Update listing

**OpenAPI schema:** `UpdateListing`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `title` | string | no |  |
| `description` | string | no |  |
| `condition` | enum(NEW \| LIKE_NEW \| GOOD \| FAIR \| POOR) | no |  |
| `priceCents` | integer | no |  |
| `listPriceCents` | integer | no |  |
| `currency` | string | no |  |
| `attributes` | object | no |  |
| `media` | ListingMedia | no |  |
| `shipping` | ListingShipping | no |  |
| `locationApprox` | string | no |  |
| `warranty` | ListingWarranty | no |  |
| `acceptsOffers` | boolean | no |  |
| `buyNowEnabled` | boolean | no |  |

**Example:**

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

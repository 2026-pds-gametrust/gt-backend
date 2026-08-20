# Schema: SellerListingPage

**OpenAPI schema:** `SellerListingPage`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `items` | array<SellerListing> | yes |  |
| `total` | integer | yes |  |
| `limit` | integer | yes |  |
| `offset` | integer | yes |  |

**Example:**

```json
{
  "items": [
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
          null
        ],
        "videoUrl": "string",
        "coverPhotoUrl": "string",
        "assetIds": [
          null
        ],
        "videoAssetId": "string"
      },
      "shipping": {
        "modes": [
          null
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
      "quantity": 0,
      "status": "DRAFT",
      "createdAt": "2026-08-07T12:00:00.000Z",
      "updatedAt": "2026-08-07T12:00:00.000Z",
      "verificationCase": {
        "id": "string",
        "status": "PENDING",
        "decisionReason": "string",
        "requiredChanges": [
          "..."
        ],
        "previousCaseId": "string",
        "updatedAt": "2026-08-07T12:00:00.000Z"
      }
    }
  ],
  "total": 0,
  "limit": 0,
  "offset": 0
}
```

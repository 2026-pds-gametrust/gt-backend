# Schema: ListingPage

**Schema OpenAPI:** `ListingPage`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `items` | array<Listing> | sim |  |
| `total` | integer | sim |  |
| `limit` | integer | sim |  |
| `offset` | integer | sim |  |

**Exemplo:**

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
      "quantity": 0,
      "status": "DRAFT",
      "createdAt": "2026-08-07T12:00:00.000Z",
      "updatedAt": "2026-08-07T12:00:00.000Z"
    }
  ],
  "total": 0,
  "limit": 0,
  "offset": 0
}
```

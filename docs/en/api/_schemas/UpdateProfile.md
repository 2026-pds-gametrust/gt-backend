# Schema: UpdateProfile

**OpenAPI schema:** `UpdateProfile`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `displayName` | string | no |  |
| `bio` | string | no |  |
| `locationApprox` | string | no |  |
| `addresses` | array<Address> | no |  |
| `defaultShippingAddressId` | string | no |  |
| `setupItems` | array<object> | no |  |

**Example:**

```json
{
  "displayName": "string",
  "bio": "string",
  "locationApprox": "string",
  "addresses": [
    {
      "id": "string",
      "label": "string",
      "recipientName": "string",
      "postalCode": "string",
      "street": "string",
      "number": "string",
      "complement": "string",
      "district": "string",
      "city": "string",
      "state": "string",
      "country": "BR",
      "isBilling": false,
      "isShipping": false,
      "geo": {
        "type": "Point",
        "coordinates": [
          0
        ]
      },
      "geoSource": "BRASIL_API"
    }
  ],
  "defaultShippingAddressId": "string",
  "setupItems": [
    {}
  ]
}
```

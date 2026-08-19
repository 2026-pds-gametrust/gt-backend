# Schema: Address

**OpenAPI schema:** `Address`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `label` | string | no |  |
| `recipientName` | string | yes |  |
| `postalCode` | string | yes | CEP 8 digits |
| `street` | string | yes | Omitted or blank on public profile reads |
| `number` | string | yes |  |
| `complement` | string | no |  |
| `district` | string | yes |  |
| `city` | string | yes |  |
| `state` | string | yes |  |
| `country` | string | yes |  |
| `isBilling` | boolean | no |  |
| `isShipping` | boolean | no |  |
| `geo` | GeoPoint | no | Present for owner/backoffice; omitted on public reads |
| `geoSource` | enum(BRASIL_API \| NOMINATIM) | no |  |

**Example:**

```json
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
```

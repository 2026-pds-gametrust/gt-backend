# Schema: CepLookupResult

**OpenAPI schema:** `CepLookupResult`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `postalCode` | string | yes |  |
| `street` | string | no |  |
| `district` | string | no |  |
| `city` | string | yes |  |
| `state` | string | yes |  |
| `geo` | GeoPoint | no |  |

**Example:**

```json
{
  "postalCode": "string",
  "street": "string",
  "district": "string",
  "city": "string",
  "state": "string",
  "geo": {
    "type": "Point",
    "coordinates": [
      0
    ]
  }
}
```

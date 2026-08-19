# Schema: CepLookupResult

**Schema OpenAPI:** `CepLookupResult`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `postalCode` | string | sim |  |
| `street` | string | não |  |
| `district` | string | não |  |
| `city` | string | sim |  |
| `state` | string | sim |  |
| `geo` | GeoPoint | não |  |

**Exemplo:**

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

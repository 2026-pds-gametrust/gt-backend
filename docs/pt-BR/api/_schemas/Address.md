# Schema: Address

**Schema OpenAPI:** `Address`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `label` | string | não |  |
| `recipientName` | string | sim |  |
| `postalCode` | string | sim | CEP 8 digits |
| `street` | string | sim | Omitted or blank on public profile reads |
| `number` | string | sim |  |
| `complement` | string | não |  |
| `district` | string | sim |  |
| `city` | string | sim |  |
| `state` | string | sim |  |
| `country` | string | sim |  |
| `isBilling` | boolean | não |  |
| `isShipping` | boolean | não |  |
| `geo` | GeoPoint | não | Present for owner/backoffice; omitted on public reads |
| `geoSource` | enum(BRASIL_API \| NOMINATIM) | não |  |

**Exemplo:**

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

# Contrato de entrada — Update profile by id

**Schema OpenAPI:** `UpdateProfile`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `displayName` | string | não |  |
| `bio` | string | não |  |
| `locationApprox` | string | não |  |
| `addresses` | array<Address> | não |  |
| `defaultShippingAddressId` | string | não |  |
| `setupItems` | array<object> | não |  |

**Exemplo:**

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

# Contrato de saída — Lexical search over published listing documents

**HTTP 200** — Matching search documents

**Tipo:** array de `SearchDocument`

**Schema OpenAPI:** `SearchDocument`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `listingId` | string | sim |  |
| `productId` | string | sim |  |
| `categoryId` | string | sim |  |
| `sellerId` | string | sim |  |
| `title` | string | sim |  |
| `brand` | string | não |  |
| `model` | string | não |  |
| `condition` | string | sim |  |
| `status` | string | sim |  |
| `priceCents` | number | sim |  |
| `listPriceCents` | number | não |  |
| `currency` | string | sim |  |
| `locationApprox` | string | não |  |
| `shippingModes` | array<string> | não |  |
| `freeShipping` | boolean | não |  |
| `trustScore` | number | não |  |
| `sellerLevel` | string | não |  |
| `sealTypes` | array<string> | não |  |
| `facets` | object | não |  |
| `searchText` | string | sim |  |
| `thumbnailUrl` | string | não |  |
| `embedding` | array<number> | não |  |
| `sourceOccurredAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "listingId": "string",
  "productId": "string",
  "categoryId": "string",
  "sellerId": "string",
  "title": "string",
  "brand": "string",
  "model": "string",
  "condition": "string",
  "status": "string",
  "priceCents": 0,
  "listPriceCents": 0,
  "currency": "string",
  "locationApprox": "string",
  "shippingModes": [
    "string"
  ],
  "freeShipping": false,
  "trustScore": 0,
  "sellerLevel": "string",
  "sealTypes": [
    "string"
  ],
  "facets": {},
  "searchText": "string",
  "thumbnailUrl": "string",
  "embedding": [
    0
  ],
  "sourceOccurredAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

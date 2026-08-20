# Contrato de saída — List authenticated seller's own listings

**HTTP 200** — Seller inventory page

**Schema OpenAPI:** `SellerListingPage`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `items` | array<SellerListing> | sim |  |
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

## Erros documentados

- **400** — Invalid filter or pagination
- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **500** — Server error

### HTTP 400

Invalid filter or pagination

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Validação / `USER_UNDERAGE` / `FIELD_INVALID` (register duplicado também é 400). Destacar campos; **não** tratar 400 de register como “email já existe” na copy.

### HTTP 401

Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Limpar sessão se o access expirou; tentar `POST /auth/refresh`; se falhar, ir para login. **Não** spoofar `x-user-id`.

### HTTP 500

Server error

**Exemplo:**

```json
{
  "message": "User not found",
  "status": 404,
  "timestamp": "2025-07-15T17:30:00.000Z",
  "path": "/users/123"
}
```

Erro genérico; não vazar detalhes internos.


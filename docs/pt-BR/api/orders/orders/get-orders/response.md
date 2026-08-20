# Contrato de saída — List orders for the authenticated buyer or seller

**HTTP 200** — Paginated orders

**Schema OpenAPI:** `OrderPage`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `items` | array<Order> | sim |  |
| `page` | integer | sim |  |
| `pageSize` | integer | sim |  |
| `total` | integer | sim |  |

**Exemplo:**

```json
{
  "items": [
    {
      "id": "string",
      "listingId": "string",
      "buyerId": "string",
      "sellerId": "string",
      "shippingMode": "PICKUP",
      "priceCents": 0,
      "currency": "string",
      "status": "AWAITING_PAYMENT",
      "reservationExpiresAt": "2026-08-07T12:00:00.000Z",
      "createdAt": "2026-08-07T12:00:00.000Z",
      "updatedAt": "2026-08-07T12:00:00.000Z"
    }
  ],
  "page": 0,
  "pageSize": 0,
  "total": 0
}
```

## Erros documentados

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **500** — Server error

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


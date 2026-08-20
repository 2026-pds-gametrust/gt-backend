# Contrato de saída — Create a buy-now order for a published listing

**HTTP 201** — Order created awaiting escrow

**Schema OpenAPI:** `Order`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `listingId` | string | sim |  |
| `buyerId` | string | sim |  |
| `sellerId` | string | sim |  |
| `shippingMode` | enum(PICKUP \| SHIPPING) | sim |  |
| `priceCents` | integer | sim |  |
| `currency` | string | sim |  |
| `status` | OrderStatus | sim |  |
| `reservationExpiresAt` | string (date-time) | sim |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
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
```

## Erros documentados

- **400** — Validation error
- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Authenticated caller is not in an allowed group
- **404** — Listing or order not found
- **409** — Listing unavailable or already reserved
- **500** — Server error

### HTTP 400

Validation error

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

### HTTP 403

Authenticated caller is not in an allowed group

**Exemplo:**

```json
{
  "error": "Access denied"
}
```

Usuário autenticado sem permissão — mensagem de acesso negado, sem fingir que a ação ocorreu.

### HTTP 404

Listing or order not found

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / 404 de página. Não inventar recurso.

### HTTP 409

Listing unavailable or already reserved

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Conflito (ex.: transição ilegal). Mostrar o `code` do catálogo.

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


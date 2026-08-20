# Contrato de saída — Get product by id

**HTTP 200** — Product found

**Schema OpenAPI:** `Product`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `categoryId` | string | sim |  |
| `brand` | string | sim |  |
| `model` | string | sim |  |
| `series` | string | não |  |
| `slug` | string | sim |  |
| `mpn` | string | não |  |
| `ean` | string | não |  |
| `sku` | string | não |  |
| `specs` | object | não |  |
| `imageUrls` | array<string> | não |  |
| `imageAssetIds` | array<string> | não |  |
| `referencePriceCents` | integer | não |  |
| `currency` | string | não |  |
| `status` | enum(ACTIVE \| INACTIVE) | sim |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "categoryId": "string",
  "brand": "string",
  "model": "string",
  "series": "string",
  "slug": "string",
  "mpn": "string",
  "ean": "string",
  "sku": "string",
  "specs": {},
  "imageUrls": [
    "string"
  ],
  "imageAssetIds": [
    "string"
  ],
  "referencePriceCents": 0,
  "currency": "string",
  "status": "ACTIVE",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **404** — Not found
- **500** — Server error

### HTTP 404

Not found

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / 404 de página. Não inventar recurso.

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


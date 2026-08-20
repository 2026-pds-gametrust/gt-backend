# Contrato de saída — List verified public listings

**HTTP 200** — Verified listing page or seller-filtered list

```json
{
  "oneOf": [
    {
      "$ref": "#/components/schemas/ListingPage"
    },
    {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/Listing"
      }
    }
  ]
}
```

## Erros documentados

- **400** — Invalid pagination
- **500** — Server error

### HTTP 400

Invalid pagination

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Validação / `USER_UNDERAGE` / `FIELD_INVALID` (register duplicado também é 400). Destacar campos; **não** tratar 400 de register como “email já existe” na copy.

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


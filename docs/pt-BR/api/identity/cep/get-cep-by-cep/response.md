# Contrato de saída — Lookup Brazilian postal code via BrasilAPI

**HTTP 200** — CEP found

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

## Erros documentados

- **400** — Invalid CEP
- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Caller is not in an allowed user group
- **404** — CEP not found
- **500** — Server error
- **502** — Maps/CEP upstream failure

### HTTP 400

Invalid CEP

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

Caller is not in an allowed user group

**Exemplo:**

```json
{
  "error": "Access denied"
}
```

Usuário autenticado sem permissão — mensagem de acesso negado, sem fingir que a ação ocorreu.

### HTTP 404

CEP not found

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

### HTTP 502

Maps/CEP upstream failure

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Erro genérico; não vazar detalhes internos.


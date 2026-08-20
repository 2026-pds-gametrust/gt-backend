# Contrato de saída — Get a short-lived content grant

**HTTP 200** — Presigned GET

**Schema OpenAPI:** `MediaContentGrant`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `url` | string | sim |  |
| `expiresAt` | string (date-time) | sim |  |

**Exemplo:**

```json
{
  "url": "string",
  "expiresAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **403** — Forbidden
- **404** — Asset not found

### HTTP 403

Forbidden

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Usuário autenticado sem permissão — mensagem de acesso negado, sem fingir que a ação ocorreu.

### HTTP 404

Asset not found

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / 404 de página. Não inventar recurso.


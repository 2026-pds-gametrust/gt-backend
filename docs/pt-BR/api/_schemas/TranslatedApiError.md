# Schema: TranslatedApiError

**Schema OpenAPI:** `TranslatedApiError`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `error` | string | sim | Localized error message (from error catalog) |
| `code` | string | sim | Stable machine-readable error code |
| `contextInfo` | object | não | Optional extra context from the service layer |

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

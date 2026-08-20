# Schema: TranslatedApiError

**OpenAPI schema:** `TranslatedApiError`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `error` | string | yes | Localized error message (from error catalog) |
| `code` | string | yes | Stable machine-readable error code |
| `contextInfo` | object | no | Optional extra context from the service layer |

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

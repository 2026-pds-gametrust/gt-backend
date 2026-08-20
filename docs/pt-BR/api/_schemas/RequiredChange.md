# Schema: RequiredChange

**Schema OpenAPI:** `RequiredChange`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `target` | enum(PHOTO \| VIDEO \| DESCRIPTION) | sim |  |
| `reason` | string | sim |  |
| `assetId` | string | não |  |
| `checklistItemId` | string | não |  |

**Exemplo:**

```json
{
  "target": "PHOTO",
  "reason": "string",
  "assetId": "string",
  "checklistItemId": "string"
}
```

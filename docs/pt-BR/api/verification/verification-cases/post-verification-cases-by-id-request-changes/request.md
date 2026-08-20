# Contrato de entrada — Request granular listing changes (backoffice)

**Schema OpenAPI:** `RequestVerificationChanges`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `summary` | string | sim |  |
| `requiredChanges` | array<RequiredChangeInput> | sim |  |

**Exemplo:**

```json
{
  "summary": "string",
  "requiredChanges": [
    {
      "target": "PHOTO",
      "reason": "string",
      "assetId": "string",
      "checklistItemId": "string"
    }
  ]
}
```

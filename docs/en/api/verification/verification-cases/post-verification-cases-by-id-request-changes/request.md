# Request — Request granular listing changes (backoffice)

**OpenAPI schema:** `RequestVerificationChanges`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `summary` | string | yes |  |
| `requiredChanges` | array<RequiredChangeInput> | yes |  |

**Example:**

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

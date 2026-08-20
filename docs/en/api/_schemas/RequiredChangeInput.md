# Schema: RequiredChangeInput

**OpenAPI schema:** `RequiredChangeInput`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `target` | enum(PHOTO \| VIDEO \| DESCRIPTION) | yes |  |
| `reason` | string | yes |  |
| `assetId` | string | no |  |
| `checklistItemId` | string | no |  |

**Example:**

```json
{
  "target": "PHOTO",
  "reason": "string",
  "assetId": "string",
  "checklistItemId": "string"
}
```

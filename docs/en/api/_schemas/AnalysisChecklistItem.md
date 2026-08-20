# Schema: AnalysisChecklistItem

**OpenAPI schema:** `AnalysisChecklistItem`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `status` | enum(PASS \| FAIL \| UNCERTAIN) | yes |  |
| `weight` | integer | yes |  |
| `reason` | string | yes |  |
| `evidenceRef` | string | no |  |

**Example:**

```json
{
  "id": "string",
  "status": "PASS",
  "weight": 0,
  "reason": "string",
  "evidenceRef": "string"
}
```

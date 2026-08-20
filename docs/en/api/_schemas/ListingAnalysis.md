# Schema: ListingAnalysis

**OpenAPI schema:** `ListingAnalysis`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `listingId` | string | yes |  |
| `scope` | enum(DRAFT \| SUBMIT) | yes |  |
| `status` | enum(PENDING \| COMPLETED \| UNAVAILABLE \| FAILED) | yes |  |
| `score` | integer | yes |  |
| `items` | array<AnalysisChecklistItem> | yes |  |
| `modelId` | string | no |  |
| `promptVersion` | string | yes |  |
| `idempotencyKey` | string | yes |  |
| `failureReason` | string | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "listingId": "string",
  "scope": "DRAFT",
  "status": "PENDING",
  "score": 0,
  "items": [
    {
      "id": "string",
      "status": "PASS",
      "weight": 0,
      "reason": "string",
      "evidenceRef": "string"
    }
  ],
  "modelId": "string",
  "promptVersion": "string",
  "idempotencyKey": "string",
  "failureReason": "string",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

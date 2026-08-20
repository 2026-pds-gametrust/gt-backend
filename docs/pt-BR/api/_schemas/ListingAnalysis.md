# Schema: ListingAnalysis

**Schema OpenAPI:** `ListingAnalysis`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `listingId` | string | sim |  |
| `scope` | enum(DRAFT \| SUBMIT) | sim |  |
| `status` | enum(PENDING \| COMPLETED \| UNAVAILABLE \| FAILED) | sim |  |
| `score` | integer | sim |  |
| `items` | array<AnalysisChecklistItem> | sim |  |
| `modelId` | string | não |  |
| `promptVersion` | string | sim |  |
| `idempotencyKey` | string | sim |  |
| `failureReason` | string | não |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

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

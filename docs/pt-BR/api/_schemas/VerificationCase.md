# Schema: VerificationCase

**Schema OpenAPI:** `VerificationCase`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `listingId` | string | sim |  |
| `status` | VerificationCaseStatus | sim |  |
| `checklist` | object | não |  |
| `decisionReason` | string | não |  |
| `moderatorId` | string | não |  |
| `requiredChanges` | array<RequiredChange> | não |  |
| `revisionBaseline` | RevisionBaseline | não |  |
| `previousCaseId` | string | não |  |
| `proofCodeIssuedAt` | string (date-time) | não | When the possession challenge was issued (hash is internal-only) |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "listingId": "string",
  "status": "PENDING",
  "checklist": {},
  "decisionReason": "string",
  "moderatorId": "string",
  "requiredChanges": [
    {
      "target": "PHOTO",
      "reason": "string",
      "assetId": "string",
      "checklistItemId": "string"
    }
  ],
  "revisionBaseline": {
    "assetIds": [
      "string"
    ],
    "videoAssetId": "string",
    "description": "string"
  },
  "previousCaseId": "string",
  "proofCodeIssuedAt": "2026-08-07T12:00:00.000Z",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

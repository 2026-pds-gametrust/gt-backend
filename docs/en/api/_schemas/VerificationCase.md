# Schema: VerificationCase

**OpenAPI schema:** `VerificationCase`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `listingId` | string | yes |  |
| `status` | enum(PENDING \| IN_REVIEW \| APPROVED \| CHANGES_REQUESTED \| REJECTED) | yes |  |
| `checklist` | object | no |  |
| `decisionReason` | string | no |  |
| `moderatorId` | string | no |  |
| `requiredChanges` | array<RequiredChange> | no |  |
| `revisionBaseline` | RevisionBaseline | no |  |
| `previousCaseId` | string | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

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
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

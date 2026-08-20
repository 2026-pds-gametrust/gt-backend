# Schema: SellerVerificationSummary

**OpenAPI schema:** `SellerVerificationSummary`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `status` | VerificationCaseStatus | yes |  |
| `decisionReason` | string | no | Present when status is REJECTED or CHANGES_REQUESTED and a seller-facing reason exists |
| `requiredChanges` | array<RequiredChange> | no |  |
| `previousCaseId` | string | no |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "status": "PENDING",
  "decisionReason": "string",
  "requiredChanges": [
    {
      "target": "PHOTO",
      "reason": "string",
      "assetId": "string",
      "checklistItemId": "string"
    }
  ],
  "previousCaseId": "string",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

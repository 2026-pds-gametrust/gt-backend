# Schema: ModerationQueueItem

**Schema OpenAPI:** `ModerationQueueItem`

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
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z",
  "listingTitle": "string",
  "listingStatus": "DRAFT",
  "listingCoverPhotoUrl": "string",
  "sellerId": "string",
  "sellerDisplayName": "string",
  "aiAnalysisScore": 0
}
```

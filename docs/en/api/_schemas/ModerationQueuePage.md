# Schema: ModerationQueuePage

**OpenAPI schema:** `ModerationQueuePage`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `items` | array<ModerationQueueItem> | yes |  |
| `total` | integer | yes |  |
| `limit` | integer | yes |  |
| `offset` | integer | yes |  |
| `stats` | ModerationQueueStats | yes |  |

**Example:**

```json
{
  "items": [
    {
      "id": "string",
      "listingId": "string",
      "status": "PENDING",
      "checklist": {},
      "decisionReason": "string",
      "moderatorId": "string",
      "requiredChanges": [
        {
          "target": null,
          "reason": null,
          "assetId": null,
          "checklistItemId": null
        }
      ],
      "revisionBaseline": {
        "assetIds": [
          null
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
  ],
  "total": 0,
  "limit": 0,
  "offset": 0,
  "stats": {
    "total": 0,
    "pending": 0,
    "inReview": 0,
    "approved": 0,
    "changesRequested": 0,
    "rejected": 0
  }
}
```

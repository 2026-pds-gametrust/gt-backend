# Schema: ListingMedia

**OpenAPI schema:** `ListingMedia`

Gallery for the used unit. Draft create may omit photos/video (empty photoUrls). Submit requires at least one resolved photo and one resolved video (via asset ids or legacy URLs). assetIds are LISTING image assets only; videoAssetId is one LISTING video asset.


| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `photoUrls` | array<string> | yes |  |
| `videoUrl` | string | no |  |
| `coverPhotoUrl` | string | no |  |
| `assetIds` | array<string> | no |  |
| `videoAssetId` | string | no | READY LISTING video/mp4 asset owned by the seller |

**Example:**

```json
{
  "photoUrls": [
    "string"
  ],
  "videoUrl": "string",
  "coverPhotoUrl": "string",
  "assetIds": [
    "string"
  ],
  "videoAssetId": "string"
}
```

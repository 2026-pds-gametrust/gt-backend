# Schema: ListingMedia

**Schema OpenAPI:** `ListingMedia`

Gallery for the used unit. Draft create may omit photos/video (empty photoUrls). Submit requires at least one resolved photo and one resolved video (via asset ids or legacy URLs). assetIds are LISTING image assets only; videoAssetId is one LISTING video asset.


| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `photoUrls` | array<string> | sim |  |
| `videoUrl` | string | não |  |
| `coverPhotoUrl` | string | não |  |
| `assetIds` | array<string> | não |  |
| `videoAssetId` | string | não | READY LISTING video/mp4 asset owned by the seller |

**Exemplo:**

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

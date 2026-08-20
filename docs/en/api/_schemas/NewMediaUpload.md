# Schema: NewMediaUpload

**OpenAPI schema:** `NewMediaUpload`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | no |  |
| `purpose` | enum(PRODUCT \| LISTING \| EVIDENCE) | yes |  |
| `ownerId` | string | yes |  |
| `contentType` | enum(image/jpeg \| image/png \| image/webp \| video/mp4) | yes | Images max 10 MiB. video/mp4 max 50 MiB and LISTING purpose only.
 |
| `byteSize` | integer | yes |  |

**Example:**

```json
{
  "id": "string",
  "purpose": "PRODUCT",
  "ownerId": "string",
  "contentType": "image/jpeg",
  "byteSize": 1
}
```

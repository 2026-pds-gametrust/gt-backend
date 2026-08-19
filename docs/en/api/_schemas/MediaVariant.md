# Schema: MediaVariant

**OpenAPI schema:** `MediaVariant`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `size` | enum(THUMBNAIL \| CARD \| FULL \| ORIGINAL) | yes |  |
| `format` | enum(WEBP \| JPEG \| MP4) | yes |  |
| `width` | integer | yes |  |
| `height` | integer | yes |  |
| `byteSize` | integer | yes |  |
| `publicUrl` | string | no |  |

**Example:**

```json
{
  "size": "THUMBNAIL",
  "format": "WEBP",
  "width": 0,
  "height": 0,
  "byteSize": 0,
  "publicUrl": "string"
}
```

# Schema: MediaAsset

**Schema OpenAPI:** `MediaAsset`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `purpose` | enum(PRODUCT \| LISTING \| EVIDENCE) | sim |  |
| `ownerId` | string | sim |  |
| `status` | enum(PENDING_UPLOAD \| UPLOADED \| PROCESSING \| READY \| FAILED) | sim |  |
| `contentType` | string | sim |  |
| `byteSize` | integer | sim |  |
| `variants` | array<MediaVariant> | sim |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "purpose": "PRODUCT",
  "ownerId": "string",
  "status": "PENDING_UPLOAD",
  "contentType": "string",
  "byteSize": 0,
  "variants": [
    {
      "size": "THUMBNAIL",
      "format": "WEBP",
      "width": 0,
      "height": 0,
      "byteSize": 0,
      "publicUrl": "string"
    }
  ],
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

# Response — Get media asset metadata

**HTTP 200** — Asset metadata (evidence never includes public URLs)

**OpenAPI schema:** `MediaAsset`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `purpose` | enum(PRODUCT \| LISTING \| EVIDENCE) | yes |  |
| `ownerId` | string | yes |  |
| `status` | enum(PENDING_UPLOAD \| UPLOADED \| PROCESSING \| READY \| FAILED) | yes |  |
| `contentType` | string | yes |  |
| `byteSize` | integer | yes |  |
| `variants` | array<MediaVariant> | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

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

## Documented errors

- **403** — Forbidden
- **404** — Asset not found

### HTTP 403

Forbidden

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Authenticated user without permission — access-denied message, do not pretend the action succeeded.

### HTTP 404

Asset not found

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / page 404. Do not invent the resource.


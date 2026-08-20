# Response — Confirm the object arrived and start processing

**HTTP 200** — Asset after complete. Normally `UPLOADED`; `READY` only under in-process dispatch. Poll GET /media/assets/{id} before attaching.


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

- **400** — Object missing or invalid
- **403** — Forbidden
- **404** — Asset not found

### HTTP 400

Object missing or invalid

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Validation / `USER_UNDERAGE` / `FIELD_INVALID` (duplicate register is also 400). Highlight fields; **do not** treat register 400 as “email already exists” in copy.

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


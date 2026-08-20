# Response — Get product by id

**HTTP 200** — Product found

**OpenAPI schema:** `Product`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `categoryId` | string | yes |  |
| `brand` | string | yes |  |
| `model` | string | yes |  |
| `series` | string | no |  |
| `slug` | string | yes |  |
| `mpn` | string | no |  |
| `ean` | string | no |  |
| `sku` | string | no |  |
| `specs` | object | no |  |
| `imageUrls` | array<string> | no |  |
| `imageAssetIds` | array<string> | no |  |
| `referencePriceCents` | integer | no |  |
| `currency` | string | no |  |
| `status` | enum(ACTIVE \| INACTIVE) | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "categoryId": "string",
  "brand": "string",
  "model": "string",
  "series": "string",
  "slug": "string",
  "mpn": "string",
  "ean": "string",
  "sku": "string",
  "specs": {},
  "imageUrls": [
    "string"
  ],
  "imageAssetIds": [
    "string"
  ],
  "referencePriceCents": 0,
  "currency": "string",
  "status": "ACTIVE",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **404** — Not found
- **500** — Server error

### HTTP 404

Not found

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / page 404. Do not invent the resource.

### HTTP 500

Server error

**Example:**

```json
{
  "message": "User not found",
  "status": 404,
  "timestamp": "2025-07-15T17:30:00.000Z",
  "path": "/users/123"
}
```

Generic error; do not leak internals.


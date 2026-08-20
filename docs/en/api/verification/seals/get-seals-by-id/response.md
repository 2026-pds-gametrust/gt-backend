# Response — Get seal by id

**HTTP 200** — Found

**OpenAPI schema:** `Seal`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `listingId` | string | yes |  |
| `caseId` | string | yes |  |
| `type` | enum(POSSESSION \| FUNCTIONING \| IDENTITY \| PROTECTED_PURCHASE \| WARRANTY) | yes |  |
| `status` | enum(GRANTED \| SUSPENDED \| EXPIRED \| REVOKED) | yes |  |
| `grantedAt` | string (date-time) | no |  |
| `expiresAt` | string (date-time) | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "listingId": "string",
  "caseId": "string",
  "type": "POSSESSION",
  "status": "GRANTED",
  "grantedAt": "2026-08-07T12:00:00.000Z",
  "expiresAt": "2026-08-07T12:00:00.000Z",
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **404** — Not found

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


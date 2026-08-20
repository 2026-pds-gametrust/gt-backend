# Schema: ListingEvent

**OpenAPI schema:** `ListingEvent`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `listingId` | string | yes |  |
| `fromStatus` | enum(DRAFT \| SUBMITTED \| PUBLISHED \| PAUSED \| EXPIRED \| RESERVED \| SOLD \| ) | no |  |
| `toStatus` | enum(DRAFT \| SUBMITTED \| PUBLISHED \| PAUSED \| EXPIRED \| RESERVED \| SOLD \| REJECTED) | yes |  |
| `reason` | string | no |  |
| `actorId` | string | no |  |
| `occurredAt` | string (date-time) | yes |  |

**Example:**

```json
{
  "id": "string",
  "listingId": "string",
  "fromStatus": "DRAFT",
  "toStatus": "DRAFT",
  "reason": "string",
  "actorId": "string",
  "occurredAt": "2026-08-07T12:00:00.000Z"
}
```

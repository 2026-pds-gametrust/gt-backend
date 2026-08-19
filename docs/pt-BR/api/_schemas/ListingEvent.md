# Schema: ListingEvent

**Schema OpenAPI:** `ListingEvent`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `listingId` | string | sim |  |
| `fromStatus` | enum(DRAFT \| SUBMITTED \| PUBLISHED \| PAUSED \| EXPIRED \| RESERVED \| SOLD \| ) | não |  |
| `toStatus` | enum(DRAFT \| SUBMITTED \| PUBLISHED \| PAUSED \| EXPIRED \| RESERVED \| SOLD \| REJECTED) | sim |  |
| `reason` | string | não |  |
| `actorId` | string | não |  |
| `occurredAt` | string (date-time) | sim |  |

**Exemplo:**

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

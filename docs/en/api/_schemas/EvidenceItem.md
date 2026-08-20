# Schema: EvidenceItem

**OpenAPI schema:** `EvidenceItem`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `caseId` | string | yes |  |
| `type` | enum(PHOTO \| VIDEO \| PROOF_CODE_HASH) | yes |  |
| `storageKey` | string | yes |  |
| `assetId` | string | no |  |
| `contentHash` | string | no |  |
| `createdAt` | string (date-time) | yes |  |

**Example:**

```json
{
  "id": "string",
  "caseId": "string",
  "type": "PHOTO",
  "storageKey": "string",
  "assetId": "string",
  "contentHash": "string",
  "createdAt": "2026-08-07T12:00:00.000Z"
}
```

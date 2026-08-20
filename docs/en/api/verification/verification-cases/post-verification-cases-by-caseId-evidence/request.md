# Request — Add evidence metadata to a case

**OpenAPI schema:** `NewEvidenceItem`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `type` | enum(PHOTO \| VIDEO \| PROOF_CODE_HASH) | yes |  |
| `storageKey` | string | no |  |
| `assetId` | string | no |  |
| `contentHash` | string | no |  |

**Example:**

```json
{
  "id": "string",
  "type": "PHOTO",
  "storageKey": "string",
  "assetId": "string",
  "contentHash": "string"
}
```

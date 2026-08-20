# Schema: EvidenceItem

**Schema OpenAPI:** `EvidenceItem`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `caseId` | string | sim |  |
| `type` | enum(PHOTO \| VIDEO \| PROOF_CODE_HASH) | sim |  |
| `storageKey` | string | sim |  |
| `assetId` | string | não |  |
| `contentHash` | string | não |  |
| `createdAt` | string (date-time) | sim |  |

**Exemplo:**

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

# Contrato de entrada — Add evidence metadata to a case

**Schema OpenAPI:** `NewEvidenceItem`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `type` | enum(PHOTO \| VIDEO \| PROOF_CODE_HASH) | sim |  |
| `storageKey` | string | não |  |
| `assetId` | string | não |  |
| `contentHash` | string | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "type": "PHOTO",
  "storageKey": "string",
  "assetId": "string",
  "contentHash": "string"
}
```

# Schema: SellerVerificationSummary

**Schema OpenAPI:** `SellerVerificationSummary`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `status` | enum(PENDING \| IN_REVIEW \| APPROVED \| CHANGES_REQUESTED \| REJECTED) | sim |  |
| `decisionReason` | string | não | Present when status is REJECTED or CHANGES_REQUESTED and a seller-facing reason exists |
| `requiredChanges` | array<RequiredChange> | não |  |
| `previousCaseId` | string | não |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "status": "PENDING",
  "decisionReason": "string",
  "requiredChanges": [
    {
      "target": "PHOTO",
      "reason": "string",
      "assetId": "string",
      "checklistItemId": "string"
    }
  ],
  "previousCaseId": "string",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

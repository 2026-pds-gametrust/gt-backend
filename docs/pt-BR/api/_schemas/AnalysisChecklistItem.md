# Schema: AnalysisChecklistItem

**Schema OpenAPI:** `AnalysisChecklistItem`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `status` | enum(PASS \| FAIL \| UNCERTAIN) | sim |  |
| `weight` | integer | sim |  |
| `reason` | string | sim |  |
| `evidenceRef` | string | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "status": "PASS",
  "weight": 0,
  "reason": "string",
  "evidenceRef": "string"
}
```

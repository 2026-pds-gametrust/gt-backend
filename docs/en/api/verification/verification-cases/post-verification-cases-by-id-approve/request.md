# Request — Approve case and grant seal (backoffice)

**OpenAPI schema:** `(inline)`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `decisionReason` | string | no |  |
| `sealType` | enum(POSSESSION \| FUNCTIONING \| IDENTITY \| PROTECTED_PURCHASE \| WARRANTY) | no |  |

**Example:**

```json
{
  "decisionReason": "string",
  "sealType": "POSSESSION"
}
```

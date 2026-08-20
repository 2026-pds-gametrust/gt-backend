# Schema: ListingShipping

**Schema OpenAPI:** `ListingShipping`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `modes` | array<string> | sim |  |
| `packageWeightGrams` | number | não |  |
| `packageLengthCm` | number | não |  |
| `packageWidthCm` | number | não |  |
| `packageHeightCm` | number | não |  |
| `freeShipping` | boolean | não |  |

**Exemplo:**

```json
{
  "modes": [
    "PICKUP"
  ],
  "packageWeightGrams": 0,
  "packageLengthCm": 0,
  "packageWidthCm": 0,
  "packageHeightCm": 0,
  "freeShipping": false
}
```

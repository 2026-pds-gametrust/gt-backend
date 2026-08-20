# Schema: ListingShipping

**OpenAPI schema:** `ListingShipping`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `modes` | array<string> | yes |  |
| `packageWeightGrams` | number | no |  |
| `packageLengthCm` | number | no |  |
| `packageWidthCm` | number | no |  |
| `packageHeightCm` | number | no |  |
| `freeShipping` | boolean | no |  |

**Example:**

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

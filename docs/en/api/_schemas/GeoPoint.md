# Schema: GeoPoint

**OpenAPI schema:** `GeoPoint`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `type` | enum(Point) | yes |  |
| `coordinates` | array<number> | yes | [longitude, latitude] |

**Example:**

```json
{
  "type": "Point",
  "coordinates": [
    0
  ]
}
```

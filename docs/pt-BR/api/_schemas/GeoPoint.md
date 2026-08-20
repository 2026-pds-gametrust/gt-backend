# Schema: GeoPoint

**Schema OpenAPI:** `GeoPoint`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `type` | enum(Point) | sim |  |
| `coordinates` | array<number> | sim | [longitude, latitude] |

**Exemplo:**

```json
{
  "type": "Point",
  "coordinates": [
    0
  ]
}
```

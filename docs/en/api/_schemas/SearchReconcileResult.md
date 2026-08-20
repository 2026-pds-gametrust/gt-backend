# Schema: SearchReconcileResult

**OpenAPI schema:** `SearchReconcileResult`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `listingsReindexed` | integer | yes | Count of PUBLISHED listings successfully upserted into search_documents |
| `synonymsUpserted` | integer | yes | Count of taxonomy terms upserted into synonyms projection |

**Example:**

```json
{
  "listingsReindexed": 0,
  "synonymsUpserted": 0
}
```

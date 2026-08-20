# Schema: SearchReconcileResult

**Schema OpenAPI:** `SearchReconcileResult`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `listingsReindexed` | integer | sim | Count of PUBLISHED listings successfully upserted into search_documents |
| `synonymsUpserted` | integer | sim | Count of taxonomy terms upserted into synonyms projection |

**Exemplo:**

```json
{
  "listingsReindexed": 0,
  "synonymsUpserted": 0
}
```

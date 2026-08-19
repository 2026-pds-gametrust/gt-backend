# Response — Rebuild search_documents for PUBLISHED listings and synonym projections from taxonomy

**HTTP 200** — Reconciliation counts

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

## Documented errors

- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Authenticated caller is not in an allowed group

### HTTP 401

Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Clear the session if access expired; try `POST /auth/refresh`; if that fails, go to login. **Do not** spoof `x-user-id`.

### HTTP 403

Authenticated caller is not in an allowed group

**Example:**

```json
{
  "error": "Access denied"
}
```

Authenticated user without permission — access-denied message, do not pretend the action succeeded.


# Parameters — Lexical search over published listing documents

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `q` | query | no | string |  |
| `categoryId` | query | no | string |  |
| `filters` | query | no | string | JSON object of facet filters |
| `userId` | query | no | string |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

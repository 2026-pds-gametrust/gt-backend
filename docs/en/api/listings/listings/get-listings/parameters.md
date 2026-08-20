# Parameters — List verified public listings

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `sellerId` | query | no | string | Filter by seller; non-owners receive verified listings only |
| `limit` | query | no | integer |  |
| `offset` | query | no | integer |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

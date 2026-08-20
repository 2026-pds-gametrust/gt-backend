# Parameters — List synonym projections for expansion

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `q` | query | no | string |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

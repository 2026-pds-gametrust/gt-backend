# Parameters — Get trust score for seller (default 0)

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `sellerId` | path | yes | string |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

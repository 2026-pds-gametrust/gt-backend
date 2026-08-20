# Parameters — Get profile by user id

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `userId` | path | yes | string |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

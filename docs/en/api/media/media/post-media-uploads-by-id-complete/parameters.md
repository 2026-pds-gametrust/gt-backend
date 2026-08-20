# Parameters — Confirm the object arrived and start processing

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `id` | path | yes | string |  |
| `undefined` | undefined | no | string |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

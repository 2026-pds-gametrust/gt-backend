# Parameters — Create a presigned image or listing video upload grant

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `undefined` | undefined | no | string |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |
| `Content-Type` | with body | `application/json` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

# Parameters — List conversations for the authenticated actor

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `limit` | query | no | integer |  |
| `cursor` | query | no | string |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |
| `Authorization` | required on this endpoint | `Bearer <access_token>` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

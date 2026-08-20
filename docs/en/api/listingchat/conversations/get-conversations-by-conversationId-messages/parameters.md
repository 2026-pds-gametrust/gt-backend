# Parameters — Paginated message history (participant only)

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `conversationId` | path | yes | string |  |
| `limit` | query | no | integer |  |
| `before` | query | no | string |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |
| `Authorization` | required on this endpoint | `Bearer <access_token>` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

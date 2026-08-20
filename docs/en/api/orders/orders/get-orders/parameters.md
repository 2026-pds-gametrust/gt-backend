# Parameters — List orders for the authenticated buyer or seller

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `page` | query | no | integer |  |
| `pageSize` | query | no | integer |  |
| `status` | query | no | OrderStatus |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |
| `Authorization` | required on this endpoint | `Bearer <access_token>` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

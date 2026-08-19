# Parameters — List authenticated seller's own listings

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `undefined` | undefined | no | string |  |
| `undefined` | undefined | no | string |  |
| `status` | query | no | enum(DRAFT \| SUBMITTED \| PUBLISHED \| PAUSED \| EXPIRED \| RESERVED \| SOLD \| REJECTED) |  |
| `limit` | query | no | integer |  |
| `offset` | query | no | integer |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |
| `Authorization` | required on this endpoint | `Bearer <access_token>` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

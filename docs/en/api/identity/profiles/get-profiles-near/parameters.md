# Parameters — Find profiles near a GeoJSON point

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `lng` | query | yes | number |  |
| `lat` | query | yes | number |  |
| `radiusMeters` | query | no | number | Search radius in meters (capped by server) |
| `limit` | query | no | integer | Max results (capped by server) |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |
| `Authorization` | required on this endpoint | `Bearer <access_token>` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

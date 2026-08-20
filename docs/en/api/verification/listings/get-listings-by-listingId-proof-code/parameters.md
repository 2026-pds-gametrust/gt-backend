# Parameters — Ensure open case and retrieve possession proof code for a listing

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `listingId` | path | yes | string |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |
| `Authorization` | required on this endpoint | `Bearer <access_token>` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

# Parameters — Lookup Brazilian postal code via BrasilAPI

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `cep` | path | yes | string | CEP with 8 digits (non-digits are stripped by the service) |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |
| `Authorization` | required on this endpoint | `Bearer <access_token>` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

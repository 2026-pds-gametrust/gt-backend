# Parameters — Log in with email and password

_No path/query parameters._

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |
| `Content-Type` | with body | `application/json` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

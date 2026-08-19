# Parameters — List evidence metadata for a case

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `caseId` | path | yes | string |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

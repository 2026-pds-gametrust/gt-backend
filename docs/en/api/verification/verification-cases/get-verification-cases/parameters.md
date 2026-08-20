# Parameters — List verification cases for moderation

| Name | In | Required | Type | Description |
|------|----|-------------|------|----------|
| `status` | query | no | VerificationCaseStatus |  |
| `q` | query | no | string | Free-text search across case, listing and seller fields |
| `moderatorId` | query | no | string |  |
| `minScore` | query | no | integer | Minimum AI validation score (0–100) from checklist.aiAnalysis |
| `maxScore` | query | no | integer | Maximum AI validation score (0–100) from checklist.aiAnalysis |
| `hasAiScore` | query | no | boolean | When false, only cases without AI score; cannot combine with minScore/maxScore |
| `limit` | query | no | integer |  |
| `offset` | query | no | integer |  |

## Recommended headers

| Header | When | Example |
|--------|--------|--------|
| `Accept` | always | `application/json` |
| `Authorization` | required on this endpoint | `Bearer <access_token>` |

**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.

# Parâmetros — List verification cases for moderation

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `status` | query | não | VerificationCaseStatus |  |
| `q` | query | não | string | Free-text search across case, listing and seller fields |
| `moderatorId` | query | não | string |  |
| `minScore` | query | não | integer | Minimum AI validation score (0–100) from checklist.aiAnalysis |
| `maxScore` | query | não | integer | Maximum AI validation score (0–100) from checklist.aiAnalysis |
| `hasAiScore` | query | não | boolean | When false, only cases without AI score; cannot combine with minScore/maxScore |
| `limit` | query | não | integer |  |
| `offset` | query | não | integer |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |
| `Authorization` | obrigatório neste endpoint | `Bearer <access_token>` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

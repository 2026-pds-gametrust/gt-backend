# Parâmetros — List conversations for the authenticated actor

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `limit` | query | não | integer |  |
| `cursor` | query | não | string |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |
| `Authorization` | obrigatório neste endpoint | `Bearer <access_token>` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

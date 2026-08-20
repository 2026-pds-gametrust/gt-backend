# Parâmetros — Get conversation detail (participant only)

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `conversationId` | path | sim | string |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |
| `Authorization` | obrigatório neste endpoint | `Bearer <access_token>` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

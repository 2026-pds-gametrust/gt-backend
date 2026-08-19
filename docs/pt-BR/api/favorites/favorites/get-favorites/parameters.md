# Parâmetros — List favorites for the authenticated actor

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `userId` | query | não | string | Ignored. Favorites are always listed for the access-token subject. |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |
| `Authorization` | obrigatório neste endpoint | `Bearer <access_token>` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

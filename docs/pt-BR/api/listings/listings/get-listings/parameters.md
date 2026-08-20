# Parâmetros — List verified public listings

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `sellerId` | query | não | string | Filter by seller; non-owners receive verified listings only |
| `limit` | query | não | integer |  |
| `offset` | query | não | integer |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

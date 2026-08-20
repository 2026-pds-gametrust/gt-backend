# Parâmetros — List synonym projections for expansion

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `q` | query | não | string |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

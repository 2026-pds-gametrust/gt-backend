# Parâmetros — Get seller level (default NEW)

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `sellerId` | path | sim | string |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

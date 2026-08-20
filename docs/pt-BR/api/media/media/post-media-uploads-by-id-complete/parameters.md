# Parâmetros — Confirm the object arrived and start processing

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `id` | path | sim | string |  |
| `undefined` | undefined | não | string |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

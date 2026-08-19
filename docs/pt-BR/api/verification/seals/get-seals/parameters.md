# Parâmetros — List seals by listingId

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `listingId` | query | não | string |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

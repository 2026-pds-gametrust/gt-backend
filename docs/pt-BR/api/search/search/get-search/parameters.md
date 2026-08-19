# Parâmetros — Lexical search over published listing documents

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `q` | query | não | string |  |
| `categoryId` | query | não | string |  |
| `filters` | query | não | string | JSON object of facet filters |
| `userId` | query | não | string |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

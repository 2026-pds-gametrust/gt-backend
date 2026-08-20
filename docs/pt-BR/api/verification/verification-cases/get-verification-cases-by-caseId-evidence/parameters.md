# Parâmetros — List evidence metadata for a case

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `caseId` | path | sim | string |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

# Parâmetros — Add evidence metadata to a case

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `caseId` | path | sim | string |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |
| `Content-Type` | com body | `application/json` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

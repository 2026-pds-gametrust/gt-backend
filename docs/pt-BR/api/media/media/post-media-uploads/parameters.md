# Parâmetros — Create a presigned image or listing video upload grant

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `undefined` | undefined | não | string |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |
| `Content-Type` | com body | `application/json` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

# Parâmetros — Upsert category attribute schema

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `categoryId` | path | sim | string |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |
| `Content-Type` | com body | `application/json` |
| `Authorization` | obrigatório neste endpoint | `Bearer <access_token>` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

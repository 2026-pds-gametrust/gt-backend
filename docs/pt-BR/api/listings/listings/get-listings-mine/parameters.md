# Parâmetros — List authenticated seller's own listings

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `undefined` | undefined | não | string |  |
| `undefined` | undefined | não | string |  |
| `status` | query | não | enum(DRAFT \| SUBMITTED \| PUBLISHED \| PAUSED \| EXPIRED \| RESERVED \| SOLD \| REJECTED) |  |
| `limit` | query | não | integer |  |
| `offset` | query | não | integer |  |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |
| `Authorization` | obrigatório neste endpoint | `Bearer <access_token>` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

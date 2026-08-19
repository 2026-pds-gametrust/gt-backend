# Parâmetros — Lookup Brazilian postal code via BrasilAPI

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `cep` | path | sim | string | CEP with 8 digits (non-digits are stripped by the service) |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |
| `Authorization` | obrigatório neste endpoint | `Bearer <access_token>` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

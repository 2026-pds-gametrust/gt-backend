# Parâmetros — Find profiles near a GeoJSON point

| Nome | In | Obrigatório | Tipo | Descrição |
|------|----|-------------|------|----------|
| `lng` | query | sim | number |  |
| `lat` | query | sim | number |  |
| `radiusMeters` | query | não | number | Search radius in meters (capped by server) |
| `limit` | query | não | integer | Max results (capped by server) |

## Headers recomendados

| Header | Quando | Exemplo |
|--------|--------|--------|
| `Accept` | sempre | `application/json` |
| `Authorization` | obrigatório neste endpoint | `Bearer <access_token>` |

**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.

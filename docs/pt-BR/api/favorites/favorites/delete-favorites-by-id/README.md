# Delete a favorite by id

| | |
|--|--|
| **Domínio** | `favorites` |
| **Tag OpenAPI** | Favorites |
| **Método** | `DELETE` |
| **Path** | `/favorites/{id}` |
| **Status sucesso** | `204` |
| **Autorização** | Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+). |

## O que este endpoint faz

Remove favorito.

## Ganho no produto

Remove favorito.

## Como se relaciona

- Bearer: userId vem do token, não do body
- `GET /listings/{id}` — destino do favorito

- Guia do módulo: [favorites](../../../../modules/favorites.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)

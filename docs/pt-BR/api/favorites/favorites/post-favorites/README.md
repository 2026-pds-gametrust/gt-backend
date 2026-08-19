# Create a favorite

| | |
|--|--|
| **Domínio** | `favorites` |
| **Tag OpenAPI** | Favorites |
| **Método** | `POST` |
| **Path** | `/favorites` |
| **Status sucesso** | `201` |
| **Autorização** | Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+). |

## O que este endpoint faz

Lista salva do usuário — “quero depois”.

## Ganho no produto

Lista salva do usuário — “quero depois”.

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

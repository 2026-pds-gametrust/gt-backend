# Recurso: users

Domínio: `identity`

| Método | Path | Contrato |
|--------|------|----------|
| `GET` | `/users` | [Get all users](./get-users/) |
| `POST` | `/users` | [Create a new user](./post-users/) |
| `DELETE` | `/users/{id}` | [Delete a user](./delete-users-by-id/) |
| `GET` | `/users/{id}` | [Get a user by ID](./get-users-by-id/) |
| `PUT` | `/users/{id}` | [Update a user](./put-users-by-id/) |
| `PUT` | `/users/{id}/groups` | [Assign user groups (ADMIN only)](./put-users-by-id-groups/) |
| `POST` | `/users/{id}/verify` | [Verify a user identity](./post-users-by-id-verify/) |

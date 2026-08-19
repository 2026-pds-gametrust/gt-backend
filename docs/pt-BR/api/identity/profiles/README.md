# Recurso: profiles

Domínio: `identity`

| Método | Path | Contrato |
|--------|------|----------|
| `GET` | `/profiles` | [List profiles](./get-profiles/) |
| `POST` | `/profiles` | [Create a profile](./post-profiles/) |
| `GET` | `/profiles/{id}` | [Get profile by id](./get-profiles-by-id/) |
| `PUT` | `/profiles/{id}` | [Update profile by id](./put-profiles-by-id/) |
| `GET` | `/profiles/by-user/{userId}` | [Get profile by user id](./get-profiles-by-user-by-userId/) |
| `GET` | `/profiles/me` | [Get authenticated user's own profile (owner projection)](./get-profiles-me/) |
| `GET` | `/profiles/near` | [Find profiles near a GeoJSON point](./get-profiles-near/) |

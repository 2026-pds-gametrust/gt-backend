# Domain: identity

## Product value

Identity and profile anchor ownership, account verification, and addresses — a trust prerequisite. Marketplace User does not store a password; session comes from /auth/*.

## Endpoints (15)

| Method | Path | Summary | Contract |
|--------|------|--------|----------|
| `GET` | `/cep/{cep}` | Lookup Brazilian postal code via BrasilAPI | [open](./cep/get-cep-by-cep/) |
| `GET` | `/profiles` | List profiles | [open](./profiles/get-profiles/) |
| `POST` | `/profiles` | Create a profile | [open](./profiles/post-profiles/) |
| `GET` | `/profiles/{id}` | Get profile by id | [open](./profiles/get-profiles-by-id/) |
| `PUT` | `/profiles/{id}` | Update profile by id | [open](./profiles/put-profiles-by-id/) |
| `GET` | `/profiles/by-user/{userId}` | Get profile by user id | [open](./profiles/get-profiles-by-user-by-userId/) |
| `GET` | `/profiles/me` | Get authenticated user's own profile (owner projection) | [open](./profiles/get-profiles-me/) |
| `GET` | `/profiles/near` | Find profiles near a GeoJSON point | [open](./profiles/get-profiles-near/) |
| `GET` | `/users` | Get all users | [open](./users/get-users/) |
| `POST` | `/users` | Create a new user | [open](./users/post-users/) |
| `DELETE` | `/users/{id}` | Delete a user | [open](./users/delete-users-by-id/) |
| `GET` | `/users/{id}` | Get a user by ID | [open](./users/get-users-by-id/) |
| `PUT` | `/users/{id}` | Update a user | [open](./users/put-users-by-id/) |
| `PUT` | `/users/{id}/groups` | Assign user groups (ADMIN only) | [open](./users/put-users-by-id-groups/) |
| `POST` | `/users/{id}/verify` | Verify a user identity | [open](./users/post-users-by-id-verify/) |

## Resources

- [`cep/`](./cep/)
- [`profiles/`](./profiles/)
- [`users/`](./users/)

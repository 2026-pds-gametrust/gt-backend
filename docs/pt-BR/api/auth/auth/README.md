# Recurso: auth

Domínio: `auth`

| Método | Path | Contrato |
|--------|------|----------|
| `POST` | `/auth/login` | [Log in with email and password](./post-auth-login/) |
| `POST` | `/auth/logout` | [Revoke this session's refresh token and invalidate its access token](./post-auth-logout/) |
| `GET` | `/auth/me` | [Return the authenticated public User](./get-auth-me/) |
| `POST` | `/auth/refresh` | [Rotate a refresh token](./post-auth-refresh/) |
| `POST` | `/auth/register` | [Register a marketplace member and issue a session](./post-auth-register/) |

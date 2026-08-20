# Domínio: auth

## Ganho no produto

Sessão first-party: access JWT curto + refresh opaco. Sem Cognito. Headers x-user-* não autenticam.

## Endpoints (5)

| Método | Path | Resumo | Contrato |
|--------|------|--------|----------|
| `POST` | `/auth/login` | Log in with email and password | [abrir](./auth/post-auth-login/) |
| `POST` | `/auth/logout` | Revoke this session's refresh token and invalidate its access token | [abrir](./auth/post-auth-logout/) |
| `GET` | `/auth/me` | Return the authenticated public User | [abrir](./auth/get-auth-me/) |
| `POST` | `/auth/refresh` | Rotate a refresh token | [abrir](./auth/post-auth-refresh/) |
| `POST` | `/auth/register` | Register a marketplace member and issue a session | [abrir](./auth/post-auth-register/) |

## Recursos

- [`auth/`](./auth/)

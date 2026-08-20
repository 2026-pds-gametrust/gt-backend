# Domain: auth

## Product value

First-party session: short-lived access JWT + opaque refresh. No Cognito. x-user-* headers do not authenticate.

## Endpoints (5)

| Method | Path | Summary | Contract |
|--------|------|--------|----------|
| `POST` | `/auth/login` | Log in with email and password | [open](./auth/post-auth-login/) |
| `POST` | `/auth/logout` | Revoke this session's refresh token and invalidate its access token | [open](./auth/post-auth-logout/) |
| `GET` | `/auth/me` | Return the authenticated public User | [open](./auth/get-auth-me/) |
| `POST` | `/auth/refresh` | Rotate a refresh token | [open](./auth/post-auth-refresh/) |
| `POST` | `/auth/register` | Register a marketplace member and issue a session | [open](./auth/post-auth-register/) |

## Resources

- [`auth/`](./auth/)

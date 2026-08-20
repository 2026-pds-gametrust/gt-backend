# Security

Minimum contract for HTTP and domain. Canon: [docs/architecture/07-security.md](../../architecture/07-security.md) (ARCH-007). Baseline for every change: [`.cursor/rules/rule.security-baseline.mdc`](../../../.cursor/rules/rule.security-baseline.mdc). Portuguese: [pt-BR](../../pt-BR/architecture/security.md).

## Split of duties

| Layer | Does | Does not |
|-------|------|----------|
| Application | JWT, `authorizeByGroup`, OpenAPI shape, `ActorContext` | Ownership (“this listing is theirs”) |
| Domain (Service) | Ownership, state-based permissions | Parsing tokens or trusting ids in `req` |
| Infraestructure | Least-privilege I/O | Authorization decisions |
| Configuration | Named env constants | Secrets in code |

## AuthN

First-party access JWT (short-lived) + opaque refresh, hashed at rest, rotated on use. Reuse of a revoked refresh token revokes the session family. Cognito is not used.

HTTP groups in this codebase: `app-user`, `partner`, `admin`, `backoffice` (`EUserGroup`), plus non-HTTP `SYSTEM`.

## Data

- Never log tokens, passwords, authorization headers, full documents, or PII.
- Evidence media and proof codes are **restricted**: private bucket, presigned URLs, hashed codes.
- Events do not carry PII.

## Input

No raw `req.query` / `req.body` into Mongoose filters. No user-controlled outbound URLs (SSRF). Errors never leak stack traces or Mongo internals.

# Security Standard — GamerTrust Backend

feature: architecture-canon
doc: ARCH-007
status: Approved
version: 0.1.0
owner: Architecture
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph Loops Fase 1)
approvedAt: 2026-08-07

Layer security, authentication/authorization, secrets, and data privacy (PII/evidence, LGPD). Trust product rules: `context/GamerTrust-04-TRUST-EXPERIENCE.md`. Module boundaries: [01](01-modular-monolith.md); port/event hygiene: [03](03-inter-module-communication.md).

## Layer security model

Each layer has a fixed security responsibility; crossing them is a `BLOCKING_SECURITY` finding:

| Layer | Responsibility | Never |
|-------|----------------|-------|
| **Application** | Authenticate the request (JWT), authorize by group (`authorizeByGroup` middleware pattern), build the `ActorContext`, validate input shape via OpenAPI | Product ownership rules; passing `req`/tokens down |
| **Domain (Service)** | Business authorization: ownership ("seller edits own listing"), state-based permissions ("cannot review before completion") using the received `ActorContext` | Parsing tokens, reading headers, trusting client-sent ids over the actor |
| **Infraestructure** | Enforce nothing; execute with least-privilege credentials (DB user, per-queue IAM) | Authorization decisions; widening scopes "for convenience" |
| **Configuration** | Load secrets, wire middlewares and contexts | Embedding secrets in code |

- The domain receives a **validated `ActorContext`** (shared type in `src/domain/common/types/`): `userId`, `groups`, `verificationLevel` — never the raw request (DEC-070).
- **Internal ports carry no ambient authority**: every sync port method takes an explicit `ActorContext` ([03 §Actor context](03-inter-module-communication.md)); the supplier re-applies its own ownership rules. Event handlers run as a `system` actor.

## AuthN / AuthZ standard

- **AuthN**: JWT bearer tokens; validation in the auth middleware (kit `@sauvvitech/st-packages` pattern — `authorizeByGroup`).
- **Groups**: `buyer`, `seller`, `moderator`, `admin`, `service` (internal jobs). A user may hold several (buyer+seller is the normal marketplace case).
- **Route → group matrix** is maintained **next to `service.yaml`** and updated in the same PR as any route change; `service.yaml` documents the security scheme per operation. A route without an explicit entry (even `public`) fails review.
- **Ownership checks are Service business rules** (kit rule 2): the application layer answers "is this a seller?"; the `listings` Service answers "is this *their* listing?".
- Moderator/admin actions are always attributable: `ActorContext.userId` recorded in `audit_logs` / decision history (moderation module) — a product requirement (decision history, right of reply).

## Input validation

- **Boundary**: `express-openapi-validator` (already a dependency) rejects malformed requests against `service.yaml` — types, enums, required fields, formats.
- **Domain**: entities keep local invariants (`*ServiceEntity`), services keep business validation — never assume the boundary caught business rules.
- Uploads (evidence media): validate content type and size server-side; never trust the client-declared MIME.

## Secrets and configuration

- Local: `.env` via `src/configuration/dotenv.ts` + `env.constants.ts`; `.env` never committed.
- AWS: SSM Parameter Store / Secrets Manager injected at deploy; no secret in code, image, or repo.
- Env naming: `GT_<SCOPE>_<NAME>` (`GT_MONGO_URI`, `GT_SNS_TOPIC_PREFIX`, `GT_EMBEDDING_API_KEY`).
- Every new env var is registered in `env.constants.ts` and documented in the feature spec that introduces it.

## PII and evidence privacy

Data classification (drives storage, logging, and event rules):

| Class | Examples | Rules |
|-------|----------|-------|
| **Public** | Published listing content, seal status + review date, seller level, reviews | Freely served and indexed |
| **Internal** | Trust ledger entries, query logs, moderation queues | Authenticated internal surfaces only; no external exposure |
| **Personal (PII)** | Name, email, phone, address, "Meu Setup" | Minimization; served only to the owner and authorized flows; exact pickup location revealed only when the transaction requires it (product rule) |
| **Restricted** | Identity documents, evidence raw media, proof codes, serial numbers, payment/payout data | Rules below |

Restricted-class rules (DEC-071):

- **Evidence media** lives in a **private S3 bucket**; access only via short-lived presigned URLs, scoped per verification case; public listing pages show only the reviewed **evidence summary** (checklist results, approved safe frames, capture date, limitations) — never raw media.
- **Proof codes** are hashed at rest; plaintext exists only transiently during capture/validation.
- **Logs and errors must never contain restricted fields** — reviews treat a restricted field in a log statement as `BLOCKING_SECURITY`.
- AI capture guidance must flag sensitive info visible in media during capture (product rule, [06 §Guardrails](06-rag-and-vector-search.md)); flagged frames are excluded from public summaries.

### LGPD

- **Minimization & retention**: each class has a declared retention period per module spec; evidence raw media retention is bounded (long enough for disputes, then deleted).
- **Erasure (right to be forgotten)**: `identity` orchestrates via an erasure event; each module holding personal data implements its handler (anonymize orders/reviews rather than delete where transactional integrity requires it; hard-delete profiles, preferences, media).
- **Personalization data**: users can clear history / reduce personalization (product rule); this propagates to `query_logs`, recommendation state, and any per-user embeddings.

## Event and port payload hygiene

- Events carry **ids and facts, never PII** (DEC-072): `identity.user.registered` carries `userId` and verification level — not name or email. Consumers needing personal data call `IIdentityClient` with an actor context.
- Port DTOs carry the minimum fields the consumer declared; adding a field to a port DTO is a contract change reviewed like an API change.

## Infrastructure hardening

- `helmet` enabled (already in the kit bootstrap); CORS restricted to known origins.
- Rate limiting on authentication, search, and offer/negotiation endpoints (anti-abuse product rules).
- SQS/SNS IAM: each queue consumer role can receive/delete only its own queues; producers can publish only their own topics (least privilege per resource).
- Mongo user per environment with least privilege; no admin credentials in the app.

## Decisions

| ID | Decision | Chosen | Rejected alternatives | Status |
|----|----------|--------|-----------------------|--------|
| DEC-070 | Authorization placement | Group auth in application middleware; ownership/state rules in Services on a validated `ActorContext`; domain never sees tokens | Token parsing in services (layer violation); trusting client-sent user ids (spoofable) | Draft |
| DEC-071 | Evidence & proof-code handling | Restricted class: private bucket + presigned URLs, hashed codes, log-forbidden, public summary only | Serving media from public storage with obscure URLs; storing plaintext codes | Draft |
| DEC-072 | PII in messaging | Events carry ids/facts only; personal data fetched via ports with actor context | PII in event payloads (copies PII into queues, DLQs, logs — unbounded LGPD surface) | Draft |

## Approval

- Gate: APPROVED
- Approver: Plan execution gate (Ralph Loops Fase 1)
- Date: 2026-08-07

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 0.1.0 | 2026-08-07 | Initial security standard |

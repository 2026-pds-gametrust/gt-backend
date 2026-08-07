# Design — ActorContext Ownership MVP

feature: actor-context-ownership-mvp
status: Approved
version: 0.1.0
owner: Architecture
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph loop E24)
approvedAt: 2026-08-07

Requirements: docs/specs/actor-context-ownership-mvp/requirements.md (version 0.1.0)

## Context

Apply DEC-070 end-to-end: build `IActorContext` in Application middleware; enforce listing/favorite/profile ownership in Domain services.

## Requirements coverage

| Requirement | Technical support | Notes |
|-------------|-------------------|-------|
| AC-01 | `attachActorContext` + Server global middleware | headers → `req.actor` |
| AC-02 | `ListingService` ownership asserts | seller or BACKOFFICE/ADMIN |
| AC-03 | publish: admin groups; system actor only in applyVerificationApproved | |
| AC-04 | `FavoriteService.createFavorite` forces userId from actor | |
| AC-05 | `ProfileService` create/update ownership | |
| AC-06 | int tests headers + `yarn test:int` | |

## End-to-end flow

1. Request hits Express → `attachActorContext` sets `req.actor` from `x-user-id` / `x-user-groups`
2. Controller extracts body + passes `req.actor` to service (never trusts body actorId for auth)
3. Service applies ownership / publish rules; throws `IThrowedError` status 403 + `FIELD_INVALID` on denial
4. Auto-publish: `applyVerificationApproved` → `publishListing` with `{ actorId: 'system', groups: ['SYSTEM'] }`

## Layers impacted

| Layer | Paths / artifacts | Change |
|-------|-------------------|--------|
| Application | `middleware/attach-actor-context.ts`, listings/favorites/identity controllers | middleware + pass actor |
| Domain | listing/favorite/profile services + interfaces; optional actor guard helper | ownership rules |
| Configuration | Server wiring (default middleware) | register middleware |
| Contracts | `service.yaml` | headers / 403 on owned mutations |
| Bootstrap | `app.ts` / test `configApp` via Server | global middleware in Server |

## HTTP / event contracts

| Surface | Auth |
|---------|------|
| POST/PUT listings, submit, pause | actor seller or backoffice/admin |
| POST listings/:id/publish | BACKOFFICE/ADMIN (+ service check); system only non-HTTP |
| POST favorites | userId = actor.actorId |
| POST/PUT profiles | userId match or admin |

Headers: `x-user-id`, `x-user-groups` (comma-separated).

## Persistence, compatibility and migration

- No schema changes
- Body may still include `userId`/`sellerId` for resource fields; authorization uses actor

## Idempotency and concurrency

- Unchanged relative to prior loops

## Observability

- No new PII in logs; failures surface as translated 403

## Rollout and rollback

- Rollout: deploy middleware + service checks; clients must send `x-user-id` on seller flows
- Rollback: remove ownership asserts / middleware (not preferred)

## Decisions

| Decision | Chosen | Rejected alternatives |
|----------|--------|------------------------|
| Error code | `FIELD_INVALID` @ 403 | new FORBIDDEN enum (deferred) |
| Publish system | actorId `system` / group SYSTEM only in applyVerificationApproved | allow SYSTEM on HTTP publish |
| Favorites userId | force from actor | trust body userId |

## Open technical decisions

- none

## Questions returned to PO

- none

## Must not do without asking

- Allowing sellers to HTTP-publish
- Trusting body actorId over headers
- Adding FORBIDDEN without catalog/i18n alignment beyond this slice if PO prefers later

## Alignment

- docs/architecture-and-layers.md, AGENTS.md, DEC-070
- Business rules in Service; thin controllers

## Approval

- Status: APPROVED
- Approved by: Plan execution gate (Ralph loop E24)
- Date: 2026-08-07
- Approved version: 0.1.0
- Conditions: none

## Changelog

### 0.1.0 — 2026-08-07

- Initial approved design for E24

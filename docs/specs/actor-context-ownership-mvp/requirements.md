# ActorContext Ownership MVP — Requirements

feature: actor-context-ownership-mvp
status: Approved
version: 0.1.0
owner: Product
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph loop E24)
approvedAt: 2026-08-07

Classification: Feature slice

## Related specifications

- docs/architecture/07-security.md (DEC-070)
- docs/ralph/ledgers/loop-e21-phase1-integration-verify.md (deferred ActorContext ownership)
- docs/ralph/ledgers/loop-e23-verification-auto-publish.md

## Context

### Current situation

`IActorContext` exists in the shared kernel, but HTTP mutations still trust body fields (`sellerId`, `userId`, `actorId`) for ownership. DEC-070 ownership end-to-end was deferred in E21.

### Problem or opportunity

Clients can spoof ownership by sending another user's id in the body. Authorization must come from request headers via a validated `ActorContext`.

### Business impact

Prevents cross-user mutation of listings, favorites, and profiles; keeps system auto-publish attributable without opening HTTP publish to sellers.

## Objective

### OBJ-01 — ActorContext ownership on HTTP mutations

Mutating HTTP flows for listings, favorites, and profiles authorize from `req.actor` (headers), never from trusted body actor/user ids alone.

## Actors

### ACT-01 — Seller / app user

- Goal: mutate own listings, favorites, profile
- Permissions: owner when `actor.actorId` matches resource owner
- Relevant context: `x-user-id`, optional `x-user-groups`

### ACT-02 — Backoffice / Admin

- Goal: operate on behalf of users (listings, profiles); publish listings
- Permissions: groups include BACKOFFICE or ADMIN
- Relevant context: `x-user-groups`

### ACT-03 — System (event path)

- Goal: auto-publish on verification approved
- Permissions: `actorId === 'system'` or SYSTEM group — **not** via HTTP publish
- Relevant context: in-process / SQS consumer

## User stories

### US-01 — Seller owns listing mutations

As a seller, I can create/update/submit/pause only my listings so another user cannot mutate mine.

### US-02 — Favorites bound to actor

As a user, favorites I create are always stored under my actor id so I cannot write favorites for another user.

### US-03 — Profile ownership

As a user, I can create/update only my profile unless I am backoffice/admin.

### US-04 — Publish remains operator/system

As the platform, HTTP publish stays BACKOFFICE/ADMIN; system auto-publish remains the non-HTTP path.

## Business rules

### BR-01 — Attach ActorContext from headers

Source: Decision E24 / DEC-070

Middleware `attachActorContext` reads `x-user-id` and `x-user-groups` (comma-separated, same style as `authorizeByGroup`) and sets `req.actor: IActorContext`.

### BR-02 — Controllers pass actor; forbid trusting body ownership ids

Source: Decision E24

Controllers pass `req.actor` into services. Services must not treat body `actorId` / client-chosen ownership as authoritative over the actor for authorization.

### BR-03 — Listing create/update/submit/pause ownership

Source: Decision E24

Actor must be the seller (`sellerId === actor.actorId`) **or** groups include BACKOFFICE/ADMIN. Otherwise HTTP 403.

### BR-04 — Listing publish authorization

Source: Decision E24

- HTTP publish: BACKOFFICE/ADMIN only (middleware + service).
- `applyVerificationApproved` / auto-publish: allow SYSTEM group or `actorId === 'system'` only on that path — not as a substitute for HTTP seller publish.

### BR-05 — Favorites force userId from actor

Source: Decision E24

On create, `userId` is taken from `actor.actorId` (body userId is ignored for ownership).

### BR-06 — Profile create/update ownership

Source: Decision E24

Profile `userId` must match `actor.actorId` or actor groups include BACKOFFICE/ADMIN. Otherwise HTTP 403.

### BR-07 — Forbidden error shape

Source: Decision E24

On ownership failure: status **403** with existing `EErrorCode` (no FORBIDDEN member — use `FIELD_INVALID`).

## Acceptance criteria

### AC-01 — Middleware sets actor

Traceability: BR-01

Given headers `x-user-id` / `x-user-groups`, mutating handlers receive `req.actor` with matching `actorId` and `groups`.

### AC-02 — Listing seller ownership

Traceability: BR-02, BR-03, US-01

Seller can mutate own listing with `x-user-id` = sellerId; other user without admin groups gets 403.

### AC-03 — Publish gate

Traceability: BR-04, US-04

HTTP publish requires BACKOFFICE/ADMIN; system auto-publish still works via `applyVerificationApproved`.

### AC-04 — Favorites actor userId

Traceability: BR-05, US-02

Creating a favorite stores `userId` from `x-user-id`, not a different body userId.

### AC-05 — Profile ownership

Traceability: BR-06, US-03

Non-admin cannot create/update a profile for another userId (403).

### AC-06 — Int suite green

Traceability: OBJ-01

Seller HTTP flows send matching `x-user-id`; backoffice tests keep `x-user-groups`; `yarn test:int` passes.

## Non-functional

### NFR-01 — Domain purity

Ownership rules live in Services; middleware only builds ActorContext; Domain does not import Infraestructure.

### NFR-02 — Minimal contract change

Document actor headers / 403 where ownership applies; avoid unrelated OpenAPI churn.

## Out of scope

- Full JWT AuthN replacement
- Ownership on all read endpoints
- New EErrorCode FORBIDDEN (use FIELD_INVALID @ 403)
- Changing verification approve payload

## Approval

- Status: APPROVED
- Approved by: Plan execution gate (Ralph loop E24)
- Date: 2026-08-07
- Approved version: 0.1.0

## Changelog

### 0.1.0 — 2026-08-07

- Initial approved requirements for E24

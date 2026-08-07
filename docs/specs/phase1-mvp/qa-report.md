# QA Report — Phase 1 MVP

feature: phase1-mvp
status: QA_VALIDATION
version: 0.2.0
owner: Quality Assurance
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: N/A
approvedAt: N/A

Requirements version validated: entity loops E01–E20 + hardening E22–E25 (APPROVED specs under `docs/specs/*-mvp/`)
Design version validated: architecture docs + per-entity designs + hardening designs
Test plan: aggregate entity test-plans + hardening funnel (`hardening-funnel.int.test.ts`)
Mode: VERIFY (E26 — Phase 1 hardening close)

## Result

`PASS_WITH_RISKS`

## Summary

Phase 1 entity-first delivery (E01–E20) plus hardening loops E22–E25 verified. Integration suite green (**112** suites / **270** tests), unit suite green (**21** / **140**). Hardening funnel covers submit → verification case (handler) → approve → auto-publish → search → favorite with `x-user-id` ownership. The four residual risks from E21 (async domain consumers, Atlas/OpenSearch lexical, verification auto-publish, ActorContext ownership) are **resolved** by E22–E25. Remaining accepted risks: repo-wide ESLint `no-explicit-any` and nightly reconcile scheduler (manual `POST /search/reconcile` only).

## Acceptance criteria results (Phase 1 hardening close)

| AC | Result | Evidence |
|----|--------|----------|
| Entities E01–E19 delivered | PASS | Ralph INDEX + ledgers E01–E19 COMPLETED |
| Search reconciliation E20 | PASS | `POST /search/reconcile`; reconcile int tests |
| Hardening E22–E25 | PASS | Ledgers E22–E25 COMPLETED; spot-checks below |
| Hardening funnel | PASS | `src/__tests__/integration/phase1/hardening-funnel.int.test.ts` |
| Int suite green | PASS | `yarn test:int` → 112 passed / 270 tests |
| Unit suite green | PASS | `yarn test:unit` → 21 passed / 140 tests |
| Domain services pure | PASS | no mongoose in `src/domain/**/*.service.ts` |
| Controllers wired | PASS | `src/app.ts` factories Identity→Favorites + messaging |

## Spot-checks (E22–E25)

| Check | Result | Evidence |
|-------|--------|----------|
| `DomainEventRouter` + `DispatchingEventPublisher` | PASS | `src/domain/common/messaging/domain-event-router.ts`, `dispatching-event-publisher.ts`; factory wiring |
| `applyVerificationApproved` publishes SUBMITTED | PASS | `listing.service.ts` → `publishListing` with system actor |
| `attachActorContext` middleware | PASS | `src/application/middleware/attach-actor-context.ts`; registered in `app.ts` / `configApp.ts` |
| `ISearchEngine` + Mongo/Atlas engines | PASS | `search-engine.interface.ts`, `mongo-text-search.engine.ts`, `atlas-search.engine.ts` |

## Test cases executed

| TC | Priority | Level | Result | Test file |
|----|----------|-------|--------|-----------|
| Full int suite | P0 | Integration | PASS | `yarn test:int` (112 suites) |
| Full unit suite | P1 | Unit | PASS | `yarn test:unit` (21 suites) |
| Hardening funnel | P0 | Integration | PASS | `src/__tests__/integration/phase1/hardening-funnel.int.test.ts` |
| Domain event consumers | P0 | Integration | PASS | `domain-event-consumers.int.test.ts` |

## Commands executed

| Purpose | Command | Result |
|---------|---------|--------|
| Integration | `yarn test:int` | PASS (112 suites, 270 tests) |
| Unit | `yarn test:unit` | PASS (21 suites, 140 tests) |
| Targeted funnel | `yarn test:int -- hardening-funnel` | PASS (1 suite, 1 test) |

## Defects

_None blocker/critical found during E26 VERIFY._

## Architecture findings

### ARCH-01 — Repo-wide catch `any` lint debt

Severity: Non-blocking
Rule: `@typescript-eslint/no-explicit-any`
Evidence: pre-existing `yarn lint` failures across infraestructure repositories (`catch (error: any)`)
Impact: CI lint gate fails until mass-fixed
Recommended owner: agt-dev-backend (follow-up hygiene loop)

## Blocked validations

- none

## Residual risks / deferred

- Nightly reconcile scheduler (manual `POST /search/reconcile` only)
- Repo-wide ESLint `no-explicit-any` cleanup

### Resolved by E22–E25 (were residual in E21)

- ~~Async SQS domain consumers~~ → E22 (`DomainEventRouter` + `DispatchingEventPublisher` + handlers)
- ~~OpenSearch / Atlas Search~~ → E25 (`ISearchEngine` + MongoText / Atlas engines)
- ~~Auto-publish listing on verification approval~~ → E23 (`applyVerificationApproved`)
- ~~ActorContext ownership end-to-end~~ → E24 (`attachActorContext` + service ownership)

## Recommendation

- Release approved with accepted risks (Phase 1 MVP + hardening)

## Changelog

### 0.2.0 — 2026-08-07

- E26 VERIFY: hardening E22–E25 closed; funnel int test; refreshed suite counts; residual risks reduced to lint + nightly scheduler

### 0.1.0 — 2026-08-07

- Initial Phase 1 VERIFY report (E21)

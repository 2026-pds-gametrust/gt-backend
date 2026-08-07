# Design — Domain SQS Consumers MVP

feature: domain-sqs-consumers-mvp
status: Approved
version: 0.1.0
owner: Architecture
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph loop E22)
approvedAt: 2026-08-07

Requirements: docs/specs/domain-sqs-consumers-mvp/requirements.md (version 0.1.0)

## Context

Wire domain event handlers behind `IEventHandler`, route by `eventType`, and publish through `DispatchingEventPublisher` so Jest keeps green via in-process dispatch while production can enable SQS pollers.

## Requirements coverage

| Requirement | Technical support | Notes |
|-------------|-------------------|-------|
| AC-01 | SearchListingEventHandler + ListingService decouple | status_changed / published / paused |
| AC-02 | TaxonomySynonymEventHandler + Category/Service decouple | created\|updated |
| AC-03 | VerificationListingSubmittedHandler + ensureOpenCase | idempotent |
| AC-04 | ListingsVerificationApprovedHandler stub | E23 |
| AC-05 | DomainEventRouter + DispatchingEventPublisher + SqsEventConsumer | same handle() |
| NFR-01 | EVENT_INPROCESS_DISPATCH default | SQS_CONSUMERS_ENABLED≠true |
| NFR-02 | Domain contracts; SQS in infra | |

## End-to-end flow

1. Service persists then `IEventPublisher.publish(envelope)`
2. `DispatchingEventPublisher` → `SqsEventPublisher` (no-op in test) → optional `DomainEventRouter.handle`
3. Router selects handler(s) by `eventType`
4. Handler calls domain service methods (`reindexListing`, `upsertFromTaxonomy`, `ensureOpenCaseForListing`, `applyVerificationApproved`)
5. When `SQS_CONSUMERS_ENABLED=true`, `app.ts` starts `SqsEventConsumer` pollers after DB setup; in-process off

## Layers impacted

| Layer | Paths / artifacts | Change |
|-------|-------------------|--------|
| Domain | `common/messaging/*`, `*/messaging/handlers/*`, listing/category/service/verification services | router, dispatching publisher, handlers, decouple |
| Application | — | none |
| Infraestructure | `sqs-event-consumer.ts` (existing) | used by factory |
| Configuration | `event-publisher.factory`, router/consumers factories, env helpers | wiring |
| Contracts | — | no HTTP change |
| Bootstrap | `app.ts` | optional consumer start |

## Data ownership

- Owning contexts unchanged; consumers project read models (search/synonym) or open verification cases.

## HTTP / event contracts

Events (payloads keep existing shapes; specific types added alongside `status_changed`):

| eventType | Consumers |
|-----------|-----------|
| `listings.listing.status_changed` | search, verification (SUBMITTED) |
| `listings.listing.published` | search |
| `listings.listing.paused` | search |
| `listings.listing.submitted` | verification |
| `catalog.category.created\|updated` | search synonyms |
| `catalog.service.created\|updated` | search synonyms |
| `verification.case.approved` | listings stub |

## Persistence, compatibility and migration

- No schema changes
- Handlers idempotent (upsert / delete / ensure open)

## Idempotency and concurrency

- Repeated envelope: reindex upsert; synonym upsert; ensureOpenCase returns existing
- Concurrent openCase: 409 → re-read open case

## Observability

- Stub logs via `Logger` without PII
- Existing publish envelopes unchanged for ledger

## Rollout and rollback

- Rollout: feature flags `SQS_CONSUMERS_ENABLED` / `EVENT_INPROCESS_DISPATCH`
- Rollback: keep in-process true; disable consumers

## Technical risks

### TRISK-01 — Circular factory deps

- Impact: factory init deadlock
- Mitigation: lazy `getRouter()` on first dispatch; build handlers after publisher singleton exists

### TRISK-02 — Double-handle

- Impact: duplicate side effects if both SQS and in-process
- Mitigation: in-process defaults false when consumers enabled

## Decisions

| Decision | Chosen | Rejected alternatives |
|----------|--------|------------------------|
| Test strategy | In-process same handlers | Broker in Jest |
| Producer coupling | Events only | Sync Search/Synonym calls |
| Specific listing events | Emit submitted/published/paused + status_changed | Only status_changed |

## Open technical decisions

- none

## Questions returned to PO

- none

## Must not do without asking

- Auto-publish on verification approved (E23)
- Changing OpenAPI HTTP contracts

## Alignment

- Follow docs/architecture-and-layers.md and AGENTS.md
- Business rules in Service; handlers thin
- Domain must not import Infraestructure

## Approval

- Status: APPROVED
- Approved by: Plan execution gate (Ralph loop E22)
- Date: 2026-08-07
- Approved version: 0.1.0
- Conditions: none

## Changelog

### 0.1.0 — 2026-08-07

- Initial approved design for E22

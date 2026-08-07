# Design — Verification Auto-Publish MVP

feature: verification-auto-publish-mvp
status: Approved
version: 0.1.0
owner: Architecture
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph loop E23)
approvedAt: 2026-08-07

Requirements: docs/specs/verification-auto-publish-mvp/requirements.md (version 0.1.0)

## Context

Fill the E22 stub `ListingService.applyVerificationApproved` so `verification.case.approved` auto-publishes SUBMITTED listings via the existing publish path, keeping HTTP publish as override.

## Requirements coverage

| Requirement | Technical support | Notes |
|-------------|-------------------|-------|
| AC-01 | `applyVerificationApproved` → `publishListing(id, 'system')` | SUBMITTED only |
| AC-02 | early return when status is PUBLISHED | idempotent |
| AC-03 | early return for missing listing / other statuses | no throw |
| AC-04 | existing `listings.controller` publish route | no change |
| NFR-01 | in-process dispatch (E22) | int test |
| NFR-02 | rules in ListingService; thin handler | |

## End-to-end flow

1. `VerificationCaseService.approveCase` persists APPROVED and publishes `verification.case.approved` with `{ caseId, listingId }`
2. `DispatchingEventPublisher` transports then optionally `DomainEventRouter.handle`
3. `ListingsVerificationApprovedHandler` calls `listingService.applyVerificationApproved(envelope)`
4. Service loads listing by `payload.listingId`
5. SUBMITTED → `publishListing(listingId, 'system')` (status event + price history + search via existing handlers)
6. PUBLISHED / other / missing → structured no-op return

## Layers impacted

| Layer | Paths / artifacts | Change |
|-------|-------------------|--------|
| Domain | `listing.service.ts`, handler comment | implement applyVerificationApproved |
| Application | — | none (HTTP publish unchanged) |
| Infraestructure | — | none |
| Configuration | — | router already wired in E22 |
| Contracts | — | no HTTP change |
| Bootstrap | — | none |

## Data ownership

- Owning context: listings (status transition)
- Trigger: verification module event
- Downstream: search reindex via existing published handlers

## HTTP / event contracts

| eventType | Consumer | Action |
|-----------|----------|--------|
| `verification.case.approved` | `ListingsVerificationApprovedHandler` | auto-publish when SUBMITTED |

Payload (unchanged): `{ caseId, listingId }`

HTTP: `POST/PUT` publish listing remains BACKOFFICE override.

## Persistence, compatibility and migration

- No schema changes
- Uses existing `updateListingById` + listing-event append via `publishListing`

## Idempotency and concurrency

- Already PUBLISHED → no-op
- Concurrent approve + publish: second apply sees PUBLISHED and no-ops; publish transition conflicts surface only if status is unexpected mid-flight (eligible path is SUBMITTED → PUBLISHED)

## Observability

- Structured `Logger.info` on skip paths (missing listingId, missing listing, non-eligible status) without PII beyond ids/status

## Rollout and rollback

- Rollout: deploy service method; behavior activates wherever approved handler runs (in-process or SQS)
- Rollback: restore no-op stub (HTTP publish still works)

## Technical risks

### TRISK-01 — approve on DRAFT listing in legacy tests

- Impact: handler must not throw
- Mitigation: BR-03 skip non-SUBMITTED

### TRISK-02 — publish readiness validation

- Impact: SUBMITTED listings that fail `assertPublishReady` would throw from `publishListing`
- Mitigation: submit already requires photos/shipping; SHIPPING dimensions enforced at publish — same as HTTP path

## Decisions

| Decision | Chosen | Rejected alternatives |
|----------|--------|------------------------|
| Actor | literal `'system'` | invent User row for system |
| Skip vs throw on bad status | silent structured skip | throw 409 from consumer |
| Reuse publish | call `publishListing` | duplicate transition code |

## Open technical decisions

- none

## Questions returned to PO

- none

## Must not do without asking

- Removing HTTP publish
- Auto-publishing from statuses other than SUBMITTED
- Changing verification approve payload shape

## Alignment

- Follow docs/architecture-and-layers.md and AGENTS.md
- Business rules in Service; handlers thin
- Domain must not import Infraestructure

## Approval

- Status: APPROVED
- Approved by: Plan execution gate (Ralph loop E23)
- Date: 2026-08-07
- Approved version: 0.1.0
- Conditions: none

## Changelog

### 0.1.0 — 2026-08-07

- Initial approved design for E23

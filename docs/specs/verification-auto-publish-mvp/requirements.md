# Verification Auto-Publish MVP — Requirements

feature: verification-auto-publish-mvp
status: Approved
version: 0.1.0
owner: Product
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph loop E23)
approvedAt: 2026-08-07

Classification: Feature slice

## Related specifications

- docs/specs/domain-sqs-consumers-mvp/requirements.md
- docs/ralph/ledgers/loop-e22-domain-sqs-consumers.md
- docs/ralph/ledgers/loop-e23-verification-auto-publish.md

## Context

### Current situation

E22 wired `ListingsVerificationApprovedHandler` and left `ListingService.applyVerificationApproved` as a no-op stub.

### Problem or opportunity

When a verification case is approved, a SUBMITTED listing should become PUBLISHED automatically so the happy path does not require a separate backoffice publish step.

### Business impact

Shortens time-to-live for verified listings while keeping HTTP publish as an explicit override for operators.

## Objective

### OBJ-01 — Auto-publish on verification approved

On `verification.case.approved`, publish the linked listing when it is SUBMITTED; stay idempotent when already PUBLISHED.

## Actors

### ACT-01 — System (event consumer)

- Goal: apply auto-publish from verification approved events
- Permissions: internal handler / listing service only
- Relevant context: in-process or SQS

### ACT-02 — Backoffice operator

- Goal: publish a listing manually when needed
- Permissions: existing HTTP publish endpoint
- Relevant context: override path unchanged

## User stories

### US-01 — Auto-publish after approval

As the platform,
I want a listing in SUBMITTED to become PUBLISHED when its verification case is approved,
so that verified inventory goes live without a second manual publish.

### US-02 — Idempotent approved handling

As the platform,
I want replaying `verification.case.approved` to be safe when the listing is already PUBLISHED,
so that consumers can retry without conflict errors.

## Business rules

### BR-01 — Publish when SUBMITTED

Source: Decision E23

On `verification.case.approved`, load listing by `payload.listingId`. If status is SUBMITTED, call `publishListing(listingId, 'system')`.

### BR-02 — No-op when already PUBLISHED

Source: Decision E23

If listing status is already PUBLISHED, return without changing state (idempotent).

### BR-03 — Skip other statuses without throw

Source: Decision E23

If listing is missing, payload lacks listingId, or status is neither SUBMITTED nor PUBLISHED, skip without throwing (structured no-op / log).

### BR-04 — HTTP publish remains override

Source: Decision E23

Existing HTTP `publishListing` for BACKOFFICE remains available and is not removed or gated by verification approval.

### BR-05 — System actor

Source: Decision E23

Auto-publish uses actorId `'system'` on the listing status event / audit trail.

## Product flows

### FLOW-01 — Submit → approve → published

1. Seller submits listing (SUBMITTED); verification case opens
2. Moderator assigns and approves case
3. `verification.case.approved` is published
4. Listings handler → `applyVerificationApproved` → `publishListing(..., 'system')`
5. Listing is PUBLISHED; search projection reacts via existing published handlers

### FLOW-02 — Replay approved when already published

1. Listing already PUBLISHED
2. Same or replayed `verification.case.approved` arrives
3. Handler no-ops without error

## Acceptance criteria

### AC-01 — Auto-publish from approved event

Traceability: BR-01, US-01, OBJ-01

Given a SUBMITTED listing with an open verification case, when the case is approved (and in-process dispatch is on), the listing status becomes PUBLISHED with actor `system`.

### AC-02 — Idempotent when PUBLISHED

Traceability: BR-02, US-02

Re-handling `verification.case.approved` for an already PUBLISHED listing does not throw and leaves status PUBLISHED.

### AC-03 — Skip non-eligible statuses

Traceability: BR-03

Approving against a DRAFT (or other non-SUBMITTED/non-PUBLISHED) listing does not throw from the approved handler path.

### AC-04 — HTTP publish override intact

Traceability: BR-04

HTTP publish endpoint continues to call `ListingService.publishListing` independently of verification approval.

## Non-functional

### NFR-01 — No broker in Jest

Suite never requires LocalStack/SQS; in-process `DispatchingEventPublisher` exercises the same handler.

### NFR-02 — Domain purity

Business rules stay in `ListingService`; handler remains thin; Domain must not import Infraestructure.

## Out of scope

- Changing verification case state machine beyond consuming approved event
- Removing manual/backoffice publish
- OpenSearch or new HTTP routes

## Approval

- Status: APPROVED
- Approved by: Plan execution gate (Ralph loop E23)
- Date: 2026-08-07
- Approved version: 0.1.0

## Changelog

### 0.1.0 — 2026-08-07

- Initial approved requirements for E23

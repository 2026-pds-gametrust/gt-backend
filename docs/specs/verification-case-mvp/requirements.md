# VerificationCase MVP — Requirements

feature: verification-case-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E10)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Open and decide verification cases for submitted listings (human-in-the-loop).

## Scope

- Open case for listingId (PENDING)
- Assign reviewer → IN_REVIEW (backoffice)
- Approve / Reject with status machine
- Events: verification.case.submitted | .approved | .rejected
- On approve: emit verification.case.approved (unlock publish later; no ListingService coupling in MVP)

## Out of scope

- Async consumer for listings.listing.submitted
- Automatic publish of listing

## Acceptance criteria

- AC-01: Open case creates PENDING for listingId
- AC-02: Missing listing returns 404
- AC-03: Invalid transition returns 409
- AC-04: Reject without reason returns 400
- AC-05: Approve publishes verification.case.approved via IEventPublisher

## Entity source

docs/entities/verification-case/

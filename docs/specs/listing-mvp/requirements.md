# Listing MVP — Requirements

feature: listing-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E08)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Manage used-unit listings with draft/submit/publish/pause transitions.

## Scope

- CRUD under /listings; submit/publish/pause actions
- sellerId + productId must exist; quantity always 1
- Submit requires >=1 photo and shipping modes
- Events listings.listing.created / .status_changed

## Out of scope

- Non-MVP transitions (reserve/sold P2) beyond documented machine
- Verification module consumer wiring (publish is backoffice MVP gate)

## Acceptance criteria

- AC-01: Create draft status DRAFT
- AC-02: Missing seller/product returns 404
- AC-03: Submit without photos returns 400 FIELD_INVALID
- AC-04: Invalid transition returns 409
- AC-05: Create publishes listings.listing.created

## Entity source

docs/entities/listing/

# Listing Event MVP — Requirements

feature: listing-event-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E09)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Append-only ledger of listing status changes.

## Scope

- Written by ListingService on create and transitions
- GET /listings/:id/events
- No update/delete

## Out of scope

- Non-MVP transitions (reserve/sold P2) beyond documented machine
- Verification module consumer wiring (publish is backoffice MVP gate)

## Acceptance criteria

- AC-01: Create listing appends DRAFT event
- AC-02: Submit/publish append further events
- AC-03: GET events for missing listing returns 404

## Entity source

docs/entities/listing-event/

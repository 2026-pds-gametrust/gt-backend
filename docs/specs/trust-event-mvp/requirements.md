# TrustEvent MVP — Requirements

feature: trust-event-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E13)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Append-only trust ledger from seal / verification outcomes.

## Scope

- Append TrustEvent (sellerId, type, sourceEventId, payload non-PII)
- Idempotent on sourceEventId
- List by sellerId
- Trigger score recompute after append (via TrustScoreService)

## Out of scope

- ORDER_COMPLETED and P2 event types beyond stub enum

## Acceptance criteria

- AC-01: Append persists event
- AC-02: Duplicate sourceEventId is idempotent (returns existing)
- AC-03: Payload must not include CPF or street

## Entity source

docs/entities/trust-event/

# Seal MVP — Requirements

feature: seal-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E12)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Issue and revoke verification seals on listings.

## Scope

- Grant seal when case approved (GRANTED)
- Unique active (GRANTED) seal per listing
- Revoke seal
- Event verification.seal.granted / .revoked

## Out of scope

- Suspend/expire jobs
- Re-verify restore from SUSPENDED

## Acceptance criteria

- AC-01: Approve case grants seal
- AC-02: Second active seal for same listing returns 409
- AC-03: Revoke publishes verification.seal.revoked

## Entity source

docs/entities/seal/

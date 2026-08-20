# Profile MVP — Requirements

feature: profile-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E04)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Manage buyer/seller profile with optional display fields and embedded shipping/billing addresses (1:1 with user).

## Scope

- Create profile for existing user; conflict if profile already exists for userId
- Get/update by id or userId
- Validate addresses (CEP 8 digits, UF 2 letters, required street fields)
- defaultShippingAddressId must match an addresses[].id
- Events: `identity.profile.updated` with userId, profileId, locationApprox only (no street PII)
- REST under `/profiles`
- Mongo collection: `profiles`

## Out of scope

- Dedicated addresses collection
- Public listing of full street address
- Freight quoting (Phase 2)

## Acceptance criteria

- AC-01: Create profile for missing user → 404
- AC-02: Create second profile for same userId → 409
- AC-03: Invalid address (CEP/state) → 400 FIELD_INVALID / ADDRESS_*
- AC-04: defaultShippingAddressId unknown → 400 FIELD_INVALID
- AC-05: Update publishes identity.profile.updated without street/CEP in payload

## Entity source

docs/entities/profile/

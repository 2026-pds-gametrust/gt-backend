# Profile MVP — Design

feature: profile-mvp
status: Approved
version: 0.1.0

## Citations

- ARCH-002 / identity module
- ARCH-007 PII
- docs/entities/profile/*

## Placement

| Concern | Layer |
|---------|-------|
| IProfile, IAddress, entity invariants | domain/identity |
| user existence, 1:1 conflict, address rules | ProfileService |
| Mongo profiles | infraestructure |
| HTTP | IdentityController `/profiles` |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Addresses embedded on profiles (Phase 1) |
| D2 | Collection name `profiles`; OpenAPI tag Profiles |
| D3 | identity.profile.updated payload: userId, profileId, locationApprox only |
| D4 | Depends on user entity (E03) |

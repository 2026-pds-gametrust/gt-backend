# VerificationCase MVP — Design

feature: verification-case-mvp
status: Approved
version: 0.1.0

## Citations

- docs/entities/verification-case/*
- ARCH-002 module map

## Placement

| Concern | Layer |
|---------|-------|
| IVerificationCase + enums | domain/verification |
| Transitions / existence / events | VerificationCaseService |
| Mongo `verification_cases` | infraestructure |
| HTTP | VerificationController |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Collection `verification_cases` |
| D2 | Events via IEventPublisher; no CPF/street in payloads |
| D3 | On approve emit `verification.case.approved` only (listings publish remains backoffice; no ListingService wiring) |
| D4 | Approve also grants seal + records trust ledger via same-module/trust services injected in factory |

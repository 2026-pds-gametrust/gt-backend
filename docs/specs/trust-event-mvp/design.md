# TrustEvent MVP — Design

feature: trust-event-mvp
status: Approved
version: 0.1.0

## Citations

- docs/entities/trust-event/*

## Placement

| Concern | Layer |
|---------|-------|
| ITrustEvent | domain/trust |
| Append / idempotency | TrustEventService |
| Mongo `trust_events` | infraestructure |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Collection `trust_events`; unique index on sourceEventId |
| D2 | Append-only; no update/delete APIs |
| D3 | Seal granted/revoked recorded from VerificationCaseService approve/revoke path |

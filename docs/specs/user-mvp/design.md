# User MVP — Design

feature: user-mvp
status: Approved
version: 0.1.0

## Citations

- ARCH-002 / identity module
- ARCH-007 PII / DEC-072
- docs/entities/user/*

## Placement

| Concern | Layer |
|---------|-------|
| IUser, EUserStatus, entity invariants | domain/identity |
| Uniqueness, underage, events | UserService |
| Mongo users | infraestructure |
| HTTP | IdentityController `/users` |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Absorbs kit `src/domain/user` into `src/domain/identity`; no parallel stubs |
| D2 | Collection name `users`; OpenAPI tag Users |
| D3 | Default status PENDING_VERIFICATION; verified/phoneVerified false on create |
| D4 | Event payloads carry opaque userId only (no CPF/email/phone) |
| D5 | Publish after persist via IEventPublisher + createEventEnvelope |

# Profile — Behavior

## Service responsibilities

- upsert profile by `userId` (create empty profile on user registration or lazy on first edit)
- 404 if user missing
- add/update/remove address; enforce CEP/UF invariants
- set default shipping address
- expose approximate location for public seller views; full address only to owner or checkout flow (Phase 2)
- LGPD hard-delete profile + addresses with user erasure

## State machine

_No lifecycle state machine (or N/A)._

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| user missing | 404 | RESOURCE_NOT_FOUND |
| profile not found | 404 | RESOURCE_NOT_FOUND |
| invalid CEP/address | 400 | FIELD_INVALID / ADDRESS_INVALID_* |
| default address id unknown | 400 | FIELD_INVALID |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).

# Favorite — Behavior

## Service responsibilities

- add/remove
- list by user
- 409 on duplicate

## State machine

_No lifecycle state machine (or N/A)._

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| duplicate | 409 | RESOURCE_CONFLICT |
| not found | 404 | RESOURCE_NOT_FOUND |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).

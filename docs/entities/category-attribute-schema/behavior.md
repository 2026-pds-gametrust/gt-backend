# CategoryAttributeSchema — Behavior

## Service responsibilities

- get by categoryId
- update bumps version
- listings validate unit attrs against active schema

## State machine

_No lifecycle state machine (or N/A)._

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| category missing | 404 | RESOURCE_NOT_FOUND |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).

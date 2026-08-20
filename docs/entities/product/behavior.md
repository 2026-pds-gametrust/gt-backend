# Product — Behavior

## Service responsibilities

- create/update
- slug uniqueness
- 404 category
- emit product events

## State machine

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| — | ACTIVE | create |  |
| ACTIVE | INACTIVE | deactivate |  |

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| slug conflict | 409 | RESOURCE_CONFLICT |
| category not found | 404 | RESOURCE_NOT_FOUND |
| not found | 404 | RESOURCE_NOT_FOUND |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).

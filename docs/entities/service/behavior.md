# Service — Behavior

## Service responsibilities

- CRUD admin
- slug/name uniqueness in services
- synonym uniqueness across categories∪services

## State machine

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| — | ACTIVE | create |  |
| ACTIVE | INACTIVE | deactivate |  |

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| conflict slug/name/synonym | 409 | RESOURCE_CONFLICT |
| not found | 404 | RESOURCE_NOT_FOUND |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).

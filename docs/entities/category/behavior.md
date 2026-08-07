# Category — Behavior

## Service responsibilities

- create/update/deactivate
- enforce slug+name uniqueness in collection
- enforce synonym uniqueness across categories∪services → 409
- normalize synonyms before persist

## State machine

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| — | ACTIVE | create | unique slug/name/synonyms |
| ACTIVE | INACTIVE | deactivate | admin |
| INACTIVE | ACTIVE | reactivate | unique still holds |

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| slug/name exists | 409 | RESOURCE_CONFLICT |
| synonym taken | 409 | RESOURCE_CONFLICT |
| not found | 404 | RESOURCE_NOT_FOUND |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).

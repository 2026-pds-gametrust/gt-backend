# VerificationCase — Behavior

## Service responsibilities

- open on listing.submitted
- approve/reject → events
- re-open on listing.updated when relevant

## State machine

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| PENDING | IN_REVIEW | claim |  |
| IN_REVIEW | APPROVED | approve |  |
| IN_REVIEW | REJECTED | reject | reason required |

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| not found | 404 | RESOURCE_NOT_FOUND |
| invalid transition | 409 | RESOURCE_CONFLICT |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).

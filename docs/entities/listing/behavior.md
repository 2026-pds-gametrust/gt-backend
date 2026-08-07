# Listing — Behavior

## Service responsibilities

- create draft
- submit → event (require photos + shipping modes)
- publish only after verification.case.approved
- pause/expire
- P2 reserve/release conditional update DEC-041
- ownership checks via ActorContext
- validate SHIPPING dims/weight before publish
- validate listPriceCents >= priceCents when set
- quantity always 1 (reject other values)

## State machine

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| DRAFT | SUBMITTED | submit |  |
| SUBMITTED | PUBLISHED | verification approved |  |
| SUBMITTED | DRAFT | verification rejected | corrections |
| PUBLISHED | PAUSED | pause |  |
| PUBLISHED | EXPIRED | expire job |  |
| PUBLISHED | RESERVED | reserve P2 | conditional |
| RESERVED | SOLD | complete order P2 |  |
| RESERVED | PUBLISHED | release/TTL P2 |  |

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| not found | 404 | RESOURCE_NOT_FOUND |
| invalid transition | 409 | RESOURCE_CONFLICT |
| not owner | 403 | FIELD_INVALID or auth |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).

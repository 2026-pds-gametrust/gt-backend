# Listing — Behavior

## Service responsibilities

- create draft (requires ≥1 photo + video after resolve)
- submit → event (require photos + video + shipping modes)
- publish only after verification.case.approved
- pause/expire
- P2 reserve/release conditional update DEC-041
- ownership checks via ActorContext
- validate SHIPPING dims/weight before publish
- validate listPriceCents >= priceCents when set
- quantity always 1 (reject other values)
- on resubmit after CHANGES_REQUESTED: assert requiredChanges applied vs revisionBaseline
- apply async verification outcomes: approved → publish; changes_requested → DRAFT; rejected → REJECTED

## State machine

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| DRAFT | SUBMITTED | submit | media + shipping; revision changes satisfied if prior CHANGES_REQUESTED |
| SUBMITTED | PUBLISHED | verification approved |  |
| SUBMITTED | DRAFT | verification changes requested | corrections workflow |
| SUBMITTED | REJECTED | verification rejected (definitive) | terminal |
| PUBLISHED | PAUSED | pause |  |
| PUBLISHED | EXPIRED | expire job |  |
| PUBLISHED | RESERVED | reserve P2 | conditional |
| RESERVED | SOLD | complete order P2 |  |
| RESERVED | PUBLISHED | release/TTL P2 |  |
| REJECTED | — | — | terminal (no transitions) |

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| not found | 404 | RESOURCE_NOT_FOUND |
| invalid transition | 409 | RESOURCE_CONFLICT |
| not owner | 403 | FIELD_INVALID or auth |
| resubmit without required edits | 400 | FIELD_INVALID |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).
- `applyVerificationChangesRequested` / `applyVerificationRejected` skip when listing already in target state.

# VerificationCase — Behavior

## Service responsibilities

- open on listing.submitted (idempotent; links `previousCaseId` on resubmit)
- assign reviewer (PENDING → IN_REVIEW)
- approve → seal grant + event
- requestChangesCase → store requiredChanges + revisionBaseline + event
- rejectCase → definitive reject + event
- listModerationQueue with filters (status, search, AI score bounds)
- re-open on listing resubmit when prior case was CHANGES_REQUESTED

## State machine

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| PENDING | IN_REVIEW | assign |  |
| IN_REVIEW | APPROVED | approve |  |
| IN_REVIEW | CHANGES_REQUESTED | request-changes | summary + ≥1 requiredChange |
| IN_REVIEW | REJECTED | reject | reason required |
| APPROVED | — | — | terminal |
| CHANGES_REQUESTED | — | — | terminal (listing returns to DRAFT) |
| REJECTED | — | — | terminal (listing → REJECTED) |

Resubmit after CHANGES_REQUESTED creates a **new** case in PENDING with `previousCaseId`; the prior case stays terminal.

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| not found | 404 | RESOURCE_NOT_FOUND |
| invalid transition | 409 | RESOURCE_CONFLICT |
| invalid requiredChange payload | 400 | FIELD_INVALID |
| open case already exists for listing | 409 | RESOURCE_CONFLICT |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).
- `ensureOpenCaseForListing` handles race on duplicate open (409 → re-read open case).

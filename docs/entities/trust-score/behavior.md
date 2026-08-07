# TrustScore — Behavior

## Service responsibilities

- recompute after ledger append
- getTrustScore port
- publish trust.score.updated

## State machine

_No lifecycle state machine (or N/A)._

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| seller score missing → default Novo | 200 | N/A or create empty |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).

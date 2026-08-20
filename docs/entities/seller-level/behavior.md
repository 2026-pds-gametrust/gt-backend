# SellerLevel — Behavior

## Service responsibilities

- derive from TrustScore thresholds
- update with score recompute

## State machine

_No lifecycle state machine (or N/A)._

## Errors

_None specific beyond DATABASE_ERROR._

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).

# PriceHistory — Behavior

## Service responsibilities

- append only
- no update/delete except LGPD
- query by productId

## State machine

_No lifecycle state machine (or N/A)._

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| product missing | 404 | RESOURCE_NOT_FOUND |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).

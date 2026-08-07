# EvidenceItem — Behavior

## Service responsibilities

- create with case
- presigned upload URLs in application
- never log restricted fields

## State machine

_No lifecycle state machine (or N/A)._

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| case missing | 404 | RESOURCE_NOT_FOUND |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).

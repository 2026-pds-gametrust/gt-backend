# Seal — Behavior

## Service responsibilities

- grant on approve
- suspend on relevant listing.updated
- expire job
- revoke

## State machine

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| — | GRANTED | grant |  |
| GRANTED | SUSPENDED | listing change |  |
| GRANTED | EXPIRED | TTL |  |
| GRANTED | REVOKED | revoke |  |
| SUSPENDED | GRANTED | re-verify |  |

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| not found | 404 | RESOURCE_NOT_FOUND |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers (if any) must be idempotent (DEC-032).

# TrustEvent — Interface

## Domain type

`ITrustEvent`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes |  |
| sellerId | string | yes | user id |
| type | ETrustEventType | yes |  |
| sourceEventId | string | yes | Idempotency / dedupe |
| payload | object | yes | Non-PII facts |
| occurredAt | Date | yes |  |
| createdAt | Date | yes |  |

## Local invariants (Entity)

- append-only
- unique sourceEventId per consumer

## Enums

- `ETrustEventType: USER_VERIFIED, SEAL_GRANTED, SEAL_REVOKED, ORDER_COMPLETED (P2), …`

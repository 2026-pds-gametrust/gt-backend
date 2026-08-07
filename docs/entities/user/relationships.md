# User — Relationships

## References (ids)

_No outbound id references._ Profile is 1:1 owned by identity via `profile.userId`.

## Sync ports

| Port / contract | Direction | Peer |
| --- | --- | --- |
| IIdentityClient.getUserSummary | expose | listings, orders, disputes |
| IIdentityClient.getCheckoutContact (Phase 2) | expose | orders/payments — PII minimized, actor-scoped |

## Domain events

### Publishes

| Event | Payload facts |
| --- | --- |
| identity.user.registered | userId |
| identity.user.verified | userId |

No name, email, cpf, phone, or address in payloads (DEC-072).

### Consumes

_None._

## Read models / projections

- Not a read model.

## Related entities

| Entity | Role |
| --- | --- |
| [profile](../profile/) | Shipping/billing addresses, display, Meu Setup |
| listing | `sellerId` → user |
| favorite | `userId` → user |
| order (P2) | buyer/seller refs; freight uses profile address |
| payment (P2) | payer identity via ports, not embedded PII in events |

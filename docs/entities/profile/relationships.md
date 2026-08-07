# Profile — Relationships

## References (ids)

| Field | Target entity | Cardinality |
| --- | --- | --- |
| userId | user | 1 |

## Sync ports

| Port / contract | Direction | Peer |
| --- | --- | --- |
| IIdentityClient.getUserSummary | expose | may include displayName + locationApprox only |
| IIdentityClient.getShippingAddress (Phase 2) | expose | orders / freight — full address, actor-scoped |

## Domain events

### Publishes

_None_ (address changes are PII; no fan-out with street/CEP in payloads).

### Consumes

_None._

## Read models / projections

- Not a read model.

## Downstream use

| Consumer (phase) | Needs |
| --- | --- |
| search / listings (1) | `locationApprox` only |
| orders + freight (2) | default or selected `IAddress` (CEP → quote) |
| payments (2) | billing address / recipient via port, not event |

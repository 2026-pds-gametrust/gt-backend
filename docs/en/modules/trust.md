# Trust

TrustScore, ledger, seller level. API: [trust](../api/trust/). Portuguese: [pt-BR](../../pt-BR/modules/trust.md).

Entities: [trust-score](../../entities/trust-score/) · [trust-event](../../entities/trust-event/) · [seller-level](../../entities/seller-level/).

## Role

Explain **why** to trust a seller. Score is a reproducible recompute over the append-only `trust_events` ledger (DEC-042).

## Client rules

- Render score **and** reasons/events. Never reduce TrustScore to a color.
- Seller level is a progression badge, not a verification seal.
- Seal (listing) and TrustScore (seller) are different signals.

`POST /trust-events` and `POST /trust-scores/{sellerId}/recompute` are backoffice.

## Events

Publishes `trust.score.updated` after recompute. **No router consumer yet** (search is planned). Planned inbound: `verification.seal.*`, `identity.user.verified`.

Do not put PII on trust events. Ledger rows are facts (type, sellerId, amounts) — not emails.

## Related

- [Messaging](../architecture/messaging.md) · [Verification](./verification.md)
- API: [trust](../api/trust/)

# Trust

TrustScore, ledger e nível do vendedor. API: [trust](../api/trust/). Inglês: [en](../../en/modules/trust.md).

Entidades: [trust-score](../../entities/trust-score/) · [trust-event](../../entities/trust-event/) · [seller-level](../../entities/seller-level/).

## Papel

Explicar **por que** confiar no vendedor. O score é recomputação reproduzível sobre o ledger append-only `trust_events` (DEC-042).

## Regras no cliente

- Renderizar score **e** motivos/eventos. Nunca reduzir TrustScore a uma cor.
- Nível do vendedor é badge de progressão, não selo de verificação.
- Selo (listing) e TrustScore (vendedor) são sinais diferentes.

`POST /trust-events` e `POST /trust-scores/{sellerId}/recompute` são backoffice.

## Eventos

Publica `trust.score.updated` após recompute. **Ainda sem consumer no router** (search planejado). Inbound planejado: `verification.seal.*`, `identity.user.verified`.

Não coloque PII em eventos de trust. Linhas do ledger são fatos (tipo, sellerId, valores) — não emails.

## Relacionados

- [Mensageria](../architecture/messaging.md) · [Verificação](./verification.md)
- API: [trust](../api/trust/)

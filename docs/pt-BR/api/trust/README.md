# Domínio: trust

## Ganho no produto

TrustScore e nível do vendedor explicam “por que confiar” — com motivos, não só cor.

## Endpoints (5)

| Método | Path | Resumo | Contrato |
|--------|------|--------|----------|
| `GET` | `/seller-levels/{sellerId}` | Get seller level (default NEW) | [abrir](./seller-levels/get-seller-levels-by-sellerId/) |
| `GET` | `/trust-events` | List trust events by sellerId | [abrir](./trust-events/get-trust-events/) |
| `POST` | `/trust-events` | Append trust event (backoffice) | [abrir](./trust-events/post-trust-events/) |
| `GET` | `/trust-scores/{sellerId}` | Get trust score for seller (default 0) | [abrir](./trust-scores/get-trust-scores-by-sellerId/) |
| `POST` | `/trust-scores/{sellerId}/recompute` | Recompute trust score from ledger | [abrir](./trust-scores/post-trust-scores-by-sellerId-recompute/) |

## Recursos

- [`seller-levels/`](./seller-levels/)
- [`trust-events/`](./trust-events/)
- [`trust-scores/`](./trust-scores/)

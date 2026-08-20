# Domain: trust

## Product value

TrustScore and seller level explain why to trust — with reasons, not color alone.

## Endpoints (5)

| Method | Path | Summary | Contract |
|--------|------|--------|----------|
| `GET` | `/seller-levels/{sellerId}` | Get seller level (default NEW) | [open](./seller-levels/get-seller-levels-by-sellerId/) |
| `GET` | `/trust-events` | List trust events by sellerId | [open](./trust-events/get-trust-events/) |
| `POST` | `/trust-events` | Append trust event (backoffice) | [open](./trust-events/post-trust-events/) |
| `GET` | `/trust-scores/{sellerId}` | Get trust score for seller (default 0) | [open](./trust-scores/get-trust-scores-by-sellerId/) |
| `POST` | `/trust-scores/{sellerId}/recompute` | Recompute trust score from ledger | [open](./trust-scores/post-trust-scores-by-sellerId-recompute/) |

## Resources

- [`seller-levels/`](./seller-levels/)
- [`trust-events/`](./trust-events/)
- [`trust-scores/`](./trust-scores/)

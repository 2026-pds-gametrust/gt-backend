# SellerLevel

status: APPROVED
phase: 1
module: `trust`
collection: `seller_levels`
loopOrder: 15
kind: entity
dependencies: trust-score

## Summary

Discrete seller tier: Novo / Em evolução / Confiável / Excelente.

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- Product: `context/GamerTrust-*`

## Notes

May be embedded in trust_scores in implementation if design prefers; collection reserved per ARCH-002.

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/seller-level-mvp/`
- [ ] No unresolved dependency entities ahead in loop order

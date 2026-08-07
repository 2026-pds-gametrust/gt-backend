# Product

status: APPROVED
phase: 1
module: `catalog`
collection: `products`
loopOrder: 6
kind: aggregate
dependencies: category

## Summary

Canonical catalog model (brand/model/SKU/specs) grouping many used listings — Pichau-like product card data without retail stock quantity.

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- [Marketplace benchmarks](../_references/marketplace-benchmarks.md)
- Product: `context/GamerTrust-*`

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/product-mvp/`
- [ ] No unresolved dependency entities ahead in loop order

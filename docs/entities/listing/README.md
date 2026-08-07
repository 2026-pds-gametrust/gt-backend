# Listing

status: APPROVED
phase: 1
module: `listings`
collection: `listings`
loopOrder: 8
kind: aggregate
dependencies: user, product

## Summary

One physical used unit for sale (ML-style item + GamerTrust trust/evidence): price, condition, media, shipping modes, optional seller warranty. Quantity always 1.

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- [Marketplace benchmarks](../_references/marketplace-benchmarks.md)
- Product: `context/GamerTrust-*`

## Notes

Break sync cycle with verification via event payload (ARCH-002).

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/listing-mvp/`
- [ ] No unresolved dependency entities ahead in loop order

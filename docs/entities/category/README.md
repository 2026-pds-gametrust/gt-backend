# Category

status: APPROVED
phase: 1
module: `catalog`
collection: `categories`
loopOrder: 1
kind: aggregate
dependencies: —

## Summary

Unique canonical product taxonomy node (consoles, GPUs, …) with normalized synonyms for search (DEC-024).

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- Product: `context/GamerTrust-*`

## Notes

Master data for taxonomy. Search projects synonyms; does not own them.

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [x] Entity docs APPROVED (INDEX gate)
- [x] Specs under `docs/specs/category-mvp/`
- [x] Loop E01 implemented (see `docs/ralph/ledgers/loop-e01-category.md`)

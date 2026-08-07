# CategoryAttributeSchema

status: APPROVED
phase: 1
module: `catalog`
collection: `category_attribute_schemas`
loopOrder: 5
kind: entity
dependencies: category

## Summary

Per-category required/optional attribute definitions (GPU VRAM, console generation, …) driving listing forms and filters.

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- Product: `context/GamerTrust-*`

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/category-attribute-schema-mvp/`
- [ ] No unresolved dependency entities ahead in loop order

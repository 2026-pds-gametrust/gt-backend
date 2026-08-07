# Service

status: APPROVED
phase: 1
module: `catalog`
collection: `services`
loopOrder: 2
kind: aggregate
dependencies: synonym uniqueness with category

## Summary

Unique canonical marketplace service taxonomy (e.g. diagnosis, evaluation). Not a domain *Service class*. Synonyms share global uniqueness with Category (DEC-024).

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- Product: `context/GamerTrust-*`

## Notes

EN type name IServiceTaxonomy or ICatalogService to avoid clash with *Service classes in code.

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/service-mvp/`
- [ ] No unresolved dependency entities ahead in loop order

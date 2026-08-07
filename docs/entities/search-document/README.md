# SearchDocument

status: APPROVED
phase: 1
module: `search`
collection: `search_documents`
loopOrder: 16
kind: read-model
dependencies: listing, product, trust

## Summary

Disposable denormalized document for lexical search/autocomplete (DEC-043). Optional embedding field for P3.

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- Product: `context/GamerTrust-*`

## Notes

Jest never requires Atlas Search (DEC-062).

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/search-document-mvp/`
- [ ] No unresolved dependency entities ahead in loop order

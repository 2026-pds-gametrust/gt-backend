# Profile

status: APPROVED
phase: 1
module: `identity`
collection: `profiles`
loopOrder: 4
kind: entity
dependencies: user

## Summary

Public/seller-facing profile, Meu Setup, approximate location for discovery, and **shipping/billing addresses** (CEP, street, …) for freight and checkout.

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-007 Security / PII](../../architecture/07-security.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- Product: `context/GamerTrust-*`

## Notes

Owned by identity; not a separate module. Full street address is PII — not for public listing pages.

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/profile-mvp/`
- [ ] No unresolved dependency entities ahead in loop order

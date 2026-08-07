# Seal

status: APPROVED
phase: 1
module: `verification`
collection: `seals`
loopOrder: 12
kind: entity
dependencies: verification-case / listing

## Summary

Verification badge on a listing (possession, functioning, identity, …) with grant/suspend/revoke lifecycle.

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- Product: `context/GamerTrust-*`

## Notes

Suspended must never render as active.

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/seal-mvp/`
- [ ] No unresolved dependency entities ahead in loop order

# User

status: APPROVED
phase: 1
module: `identity`
collection: `users`
loopOrder: 3
kind: aggregate
dependencies: —

## Summary

Registered platform actor (buyer/seller) with ecommerce account data: legal name, email, phone, CPF, birth date, verification flags. Absorbs kit canonical user. Credentials stay in the IdP. Shipping addresses live on [profile](../profile/).

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-007 Security / PII](../../architecture/07-security.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- Product: `context/GamerTrust-*`

## Notes

- No PII in events beyond opaque `userId` (DEC-072).
- Password never persisted on `users`.
- CPF/phone/email uniqueness enforced in Service.

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/user-mvp/`
- [ ] No unresolved dependency entities ahead in loop order

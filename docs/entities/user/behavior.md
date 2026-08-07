# User — Behavior

## Service responsibilities

- `createUser`: uniqueness on `email` and `cpf` → 409; validate underage; default `verified=false`, `phoneVerified=false`, `status=PENDING_VERIFICATION` or `ACTIVE` per product rule
- `getUserById` / `getUserByEmail` → 404 when missing
- `updateUser`: re-validate CPF/email uniqueness if changed; never accept password fields
- `verifyUser` / `verifyPhone`: set flags; publish `identity.user.verified` only for identity verification (payload: `userId` only — DEC-072)
- `getUserSummary(userId)`: minimized DTO for sync ports
- LGPD erasure orchestration starts from identity (hard-delete/anonymize coordination)

## State machine

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| PENDING_VERIFICATION | ACTIVE | complete registration / email confirm | product rule |
| * | BLOCKED | admin/moderation | ActorContext admin |
| BLOCKED | ACTIVE | unblock | admin |
| unverified identity | verified | verifyUser | evidence/KYC flow |
| phoneVerified false | true | verifyPhone | OTP ok |

## Errors

| Condition | HTTP | EErrorCode |
| --- | --- | --- |
| email exists | 409 | RESOURCE_CONFLICT |
| cpf exists | 409 | RESOURCE_CONFLICT |
| not found | 404 | RESOURCE_NOT_FOUND |
| underage | 400 | USER_UNDERAGE |
| invalid cpf/phone/email | 400 | FIELD_INVALID |

## Idempotency

- Repository returns `null` when missing; Service maps to product errors.
- Event consumers must be idempotent (DEC-032).
- Registration is not idempotent on duplicate email/cpf (conflict).

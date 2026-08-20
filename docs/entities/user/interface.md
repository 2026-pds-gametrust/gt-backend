# User — Interface

## Domain type

`IUser`

Account identity for the marketplace (buyer/seller). Supports registration and downstream checkout needs (identity check, contact, age). **Password / credentials are not stored in this aggregate** — AuthN lives in the identity provider (JWT); this backend only keeps profile/commerce data.

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes | Stable public id |
| fullName | string | yes | Nome completo (legal name for KYC / invoices) |
| email | string | yes | Unique; login identifier |
| phone | string | yes | E.164 or BR national normalized; contact / 2FA / delivery |
| cpf | string | yes | 11 digits, unique; Personal (PII) — never in events/logs |
| birthDate | string (ISO date) | yes | `YYYY-MM-DD`; age checks (e.g. underage) |
| verified | boolean | yes | Identity verification completed |
| phoneVerified | boolean | yes | Default `false` until OTP/confirmed |
| status | EUserStatus | yes | `ACTIVE` \| `BLOCKED` \| `PENDING_VERIFICATION` |
| createdAt | Date | yes | timestamps |
| updatedAt | Date | yes | timestamps |

### Explicitly out of this aggregate

| Concern | Where it lives |
| --- | --- |
| Password / password hash | Identity provider (Cognito/IdP) — never in Mongo `users` |
| Shipping / billing address | [`profile`](../profile/) — `addresses[]` (CEP, street, …) |
| Payment instruments / cards | `payments` module (Phase 2) — restricted |
| Payout bank data (seller) | `payments` / `payout_accounts` (Phase 2) — restricted |

## Local invariants (Entity)

- `fullName` non-empty after trim (min length 3)
- Valid email format
- `cpf` exactly 11 numeric digits (check-digit validation in Entity or shared value object)
- `phone` non-empty after normalization
- `birthDate` parseable ISO date; not in the future
- Underage rule (e.g. &lt; 18) enforced in **Service** on register/update → product error (`USER_UNDERAGE`)

## Enums

- `EUserStatus: ACTIVE, BLOCKED, PENDING_VERIFICATION`

## Data classification (ARCH-007)

| Field | Class |
| --- | --- |
| id, verified, status, phoneVerified | Internal / public-safe summaries only as needed |
| fullName, email, phone, birthDate | Personal (PII) |
| cpf | Personal (PII) — treat as high sensitivity; never log; never put in domain events |

## Sync DTO note

`IIdentityClient.getUserSummary` must expose **minimum** fields (e.g. `userId`, `displayName` or masked name, `verified`) — **not** CPF, full address, or raw phone — unless a Phase 2 checkout port explicitly requires them with `ActorContext` and purpose limitation.

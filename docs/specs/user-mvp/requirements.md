# User MVP — Requirements

feature: user-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E03)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Register marketplace actors with ecommerce identity data (legal name, email, phone, CPF, birth date, verification flags) under the identity module, absorbing the kit canonical user.

## Scope

- CRUD-ish: create, get by id/email, list, update, delete, verify
- Uniqueness: email, cpf → 409 RESOURCE_CONFLICT
- Underage (&lt; 18) on register/update → 400 USER_UNDERAGE
- Events: `identity.user.registered`, `identity.user.verified` (payload: `userId` only — no CPF)
- REST under `/users`
- Mongo collection: `users`
- No password in domain

## Out of scope

- IdP credentials / Cognito password flows
- Shipping addresses (profile entity)
- Payment instruments

## Acceptance criteria

- AC-01: Creating user with duplicate email or cpf returns 409
- AC-02: Creating underage user returns 400 USER_UNDERAGE
- AC-03: Get unknown id returns 404
- AC-04: Create publishes `identity.user.registered` without cpf in payload
- AC-05: verifyUser sets verified and publishes `identity.user.verified` with userId only

## Entity source

docs/entities/user/

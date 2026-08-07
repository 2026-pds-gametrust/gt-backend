# Ledger — Loop E03: Entity user

## Status
COMPLETED

## Objetivo
Implementar a entidade `user` no módulo identity (Ralph entity-first E03), absorvendo o kit canonical user.

## Escopo executado
- Specs `docs/specs/user-mvp/` (requirements, design, test-plan) APPROVED
- Domain/infra/application/factories OpenAPI para `/users`
- Absorção de `src/domain/user` → `src/domain/identity`
- Eventos `identity.user.registered` / `identity.user.verified` via IEventPublisher (sem CPF no payload)
- Testes: unicidade email/cpf, underage, HTTP smoke

## Alterações
- `src/app.ts`, `src/__tests__/configApp.ts` — IdentityController
- `src/contracts/service.yaml` — schemas User + verify
- `jest/setup-integration-tests.ts` — cleanup User/Profile

## Criações
- `src/domain/identity/**` (user expandido)
- `src/infraestructure/repository/identity/**`, schema/model users
- `src/application/controllers/identity.controller.ts`
- Specs e este ledger

## Remoções
- Runtime kit `src/domain/user/**`, `src/infraestructure/repository/user/**`, `user.controller.ts`

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementar E03 | COMPLETED |

## Validações realizadas
- `yarn test:int` — identity/user suites
- Convenção when/should
- OpenAPI `/users` alinhado

## Pendências e bloqueios
- Nenhuma para E03

## Impactos nos próximos loops
- E04 profile depende de user

## Resultado final
Entidade user entregue end-to-end no módulo identity.

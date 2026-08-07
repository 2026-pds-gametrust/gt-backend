# Ledger — Loop E24: ActorContext ownership

## Status
COMPLETED

## Objetivo
Ownership end-to-end via `IActorContext` nas mutações HTTP (listings, favorites, profiles), sem confiar em `actorId`/`userId` do body.

## Escopo executado
- Specs Approved: `docs/specs/actor-context-ownership-mvp/{requirements,design,test-plan}.md`
- Middleware `attachActorContext` (headers `x-user-id` / `x-user-groups`)
- Regras de ownership em ListingService / FavoriteService / ProfileService
- Publish HTTP: BACKOFFICE/ADMIN; auto-publish SYSTEM via `applyVerificationApproved`
- OpenAPI headers + 403; int tests com `x-user-id`

## Alterações
- `src/application/middleware/attach-actor-context.ts` — cria `req.actor`
- `src/domain/common/auth/actor-authorization.ts` — guards de ownership/publish
- Controllers listings/favorites/identity — passam `req.actor`
- Services listing/favorite/profile — ownership + force favorite userId
- `src/app.ts` + `configApp.ts` — registram middleware
- `src/domain/server/server.ts` — honra `middlewaresToStart`
- `src/contracts/service.yaml` — parâmetros de header e 403
- Int tests atualizados

## Criações
- `docs/specs/actor-context-ownership-mvp/*`
- `docs/ralph/ledgers/loop-e24-actor-context-ownership.md`
- `src/__tests__/__mocks__/actor.mock.ts`

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementação E24 | COMPLETED |

## Validações realizadas
- `yarn test:int` — **PASS** — 40 suites, **105** tests

## Pendências e bloqueios
- none

## Impactos nos próximos loops
- Clientes seller devem enviar `x-user-id` em mutações de listing/favorite/profile

## Resultado final
Loop E24 COMPLETED — ActorContext ownership on HTTP mutations.

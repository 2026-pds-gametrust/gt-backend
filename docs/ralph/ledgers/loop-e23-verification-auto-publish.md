# Ledger — Loop E23: Verification auto-publish

## Status
COMPLETED

## Objetivo
Auto-publicar listing SUBMITTED quando `verification.case.approved` é processado, preenchendo o stub E22 de `applyVerificationApproved`.

## Escopo executado
- Specs Approved: `docs/specs/verification-auto-publish-mvp/{requirements,design,test-plan}.md`
- `ListingService.applyVerificationApproved`: load by listingId → SUBMITTED publish com actor `system` → PUBLISHED no-op → demais status skip
- Handler listings mantido thin; HTTP publish BACKOFFICE inalterado
- Int tests via in-process `DispatchingEventPublisher`

## Alterações
- `src/domain/listings/service/listing.service.ts` — implementação E23
- `src/domain/listings/messaging/handlers/listings-verification-approved.handler.ts` — comentário
- `src/__tests__/integration/messaging/domain-event-consumers.int.test.ts` — TC approve → PUBLISHED + idempotência
- `src/__tests__/unit/messaging/domain-event-router.unit.test.ts` — nome do cenário

## Criações
- `docs/specs/verification-auto-publish-mvp/*`
- `docs/ralph/ledgers/loop-e23-verification-auto-publish.md`

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementação E23 | COMPLETED |

## Validações realizadas
- `yarn test:unit -- domain-event-router` — **PASS** — 1 suite, **4** tests
- `yarn test:int -- domain-event-consumers` — **PASS** — 1 suite, **5** tests (incl. 2 E23)
- `yarn test:int` — **PASS** — 41 suites, **106** tests

## Pendências e bloqueios
- none

## Impactos nos próximos loops
- Fluxo happy-path submit → approve já publica listing sem publish HTTP

## Resultado final
Loop E23 COMPLETED — auto-publish on verification approved.

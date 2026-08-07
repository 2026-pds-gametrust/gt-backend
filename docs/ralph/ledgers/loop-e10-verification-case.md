# Ledger — Loop E10: Entity verification-case

## Status
COMPLETED

## Objetivo
Implementar a entidade `verification-case` conforme docs/entities/verification-case e specs `verification-case-mvp`.

## Escopo executado
- Specs `docs/specs/verification-case-mvp/` APPROVED
- Domain/infra/application/factories + OpenAPI
- Collection `verification_cases`
- Em approve: emite `verification.case.approved` (sem acoplar ListingService.publish)
- Concede seal + ledger trust via SealService

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementar E10 | COMPLETED |

## Validações realizadas
- `yarn test:int` (suite verification + trust)

## Pendências e bloqueios
- Consumer async de `listings.listing.submitted` deferred
- Unlock automático de publish via consumer deferred

## Resultado final
Entidade `verification-case` entregue end-to-end.

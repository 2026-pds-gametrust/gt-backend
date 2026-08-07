# Ledger — Loop E12: Entity seal

## Status
COMPLETED

## Objetivo
Implementar a entidade `seal` conforme docs/entities/seal e specs `seal-mvp`.

## Escopo executado
- Specs `docs/specs/seal-mvp/` APPROVED
- Grant on case approve; unique GRANTED per listing; revoke
- Events `verification.seal.granted` / `.revoked`
- Collection `seals`

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementar E12 | COMPLETED |

## Validações realizadas
- `yarn test:int`

## Pendências e bloqueios
- Suspend/expire jobs deferred

## Resultado final
Entidade `seal` entregue end-to-end.

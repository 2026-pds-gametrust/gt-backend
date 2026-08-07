# Ledger — Loop E11: Entity evidence-item

## Status
COMPLETED

## Objetivo
Implementar a entidade `evidence-item` conforme docs/entities/evidence-item e specs `evidence-item-mvp`.

## Escopo executado
- Specs `docs/specs/evidence-item-mvp/` APPROVED
- Domain/infra + rotas aninhadas em VerificationController
- Collection `evidence_items` (metadata/storageKey only)

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementar E11 | COMPLETED |

## Validações realizadas
- `yarn test:int`

## Pendências e bloqueios
- Presigned upload URLs deferred

## Resultado final
Entidade `evidence-item` entregue end-to-end.

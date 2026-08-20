# Ledger — Loop E19: Entity favorite

## Status
COMPLETED

## Objetivo
Implementar a entidade `favorite` conforme docs/entities/favorite e specs `favorite-mvp`.

## Escopo executado
- Specs `docs/specs/favorite-mvp/` APPROVED
- Collection `favorites`
- POST/DELETE/GET `/favorites`
- Unique (userId, targetType, targetId)

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementar E19 | COMPLETED |

## Validações realizadas
- `yarn test:int`

## Pendências e bloqueios
- Saved searches / alerts deferred (P2)

## Resultado final
Entidade `favorite` entregue end-to-end.

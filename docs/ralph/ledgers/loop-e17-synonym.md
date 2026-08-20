# Ledger — Loop E17: Entity synonym

## Status
COMPLETED

## Objetivo
Implementar a entidade `synonym` conforme docs/entities/synonym e specs `synonym-mvp`.

## Escopo executado
- Specs `docs/specs/synonym-mvp/` APPROVED
- Collection `synonyms`
- Projection sync from CategoryService / ServiceTaxonomyService
- GET `/synonyms`

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementar E17 | COMPLETED |

## Validações realizadas
- `yarn test:int`

## Pendências e bloqueios
- Full rebuild job deferred

## Resultado final
Entidade `synonym` entregue end-to-end.

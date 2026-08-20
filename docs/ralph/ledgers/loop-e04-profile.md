# Ledger — Loop E04: Entity profile

## Status
COMPLETED

## Objetivo
Implementar a entidade `profile` (1:1 com user) com endereços embutidos no módulo identity.

## Escopo executado
- Specs `docs/specs/profile-mvp/` (requirements, design, test-plan) APPROVED
- Domain/infra/application/factories OpenAPI para `/profiles`
- Evento `identity.profile.updated` (userId, profileId, locationApprox — sem street/CEP)
- Testes: create com address, conflict, HTTP smoke

## Alterações
- IdentityController — rotas `/profiles`
- `src/contracts/service.yaml` — tag Profiles + schemas

## Criações
- `src/domain/identity` profile entity/service/repos
- `src/infraestructure` ProfileModel/schema/adapters/repos
- `ProfileServiceFactory`
- Specs e este ledger

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementar E04 | COMPLETED |

## Validações realizadas
- `yarn test:int` — profile + regressão user/catalog

## Pendências e bloqueios
- Nenhuma para E04

## Impactos nos próximos loops
- Próximo: E05+ conforme entities INDEX

## Resultado final
Entidade profile entregue end-to-end no módulo identity.

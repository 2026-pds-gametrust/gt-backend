# Ledger — Loop E26: Phase 1 hardening VERIFY

## Status
COMPLETED

## Objetivo
Fechar o hardening da Phase 1 (E22–E25) com evidência VERIFY: funil de integração, contagens reais de testes, spot-check de artefatos e atualização do qa-report.

## Escopo executado
- Funil int cohesivo: submit → verification case (handler) → approve → auto-publish → search → favorite com ownership `x-user-id`
- `yarn test:int` + `yarn test:unit` com contagens capturadas
- Spot-check: `DomainEventRouter`, `DispatchingEventPublisher`, `applyVerificationApproved`, `attachActorContext`, `ISearchEngine` / MongoText / Atlas
- Atualização `docs/specs/phase1-mvp/qa-report.md` e INDEX Ralph (E22–E26)

## Alterações
- `docs/specs/phase1-mvp/qa-report.md` — v0.2.0; riscos E21 resolvidos por E22–E25; residual = lint + nightly scheduler
- `docs/ralph/INDEX.md` — linha E26 COMPLETED (E22–E25 já constavam)

## Criações
- `src/__tests__/integration/phase1/hardening-funnel.int.test.ts` — funil end-to-end hardening
- `docs/ralph/ledgers/loop-e26-phase1-hardening-verify.md` — este ledger

## Spot-checks

| Check | Result | Path |
|-------|--------|------|
| DomainEventRouter | PASS | `src/domain/common/messaging/domain-event-router.ts` |
| DispatchingEventPublisher | PASS | `src/domain/common/messaging/dispatching-event-publisher.ts` |
| applyVerificationApproved → PUBLISHED | PASS | `src/domain/listings/service/listing.service.ts` |
| attachActorContext | PASS | `src/application/middleware/attach-actor-context.ts` |
| ISearchEngine | PASS | `src/domain/search/engine/search-engine.interface.ts` |
| MongoTextSearchEngine | PASS | `src/infraestructure/search/mongo-text-search.engine.ts` |
| AtlasSearchEngine | PASS | `src/infraestructure/search/atlas-search.engine.ts` |

## Contagens da suíte de testes

| Suite | Command | Result |
|-------|---------|--------|
| Integration | `yarn test:int` | **PASS** — 112 suites, **270** tests |
| Unit | `yarn test:unit` | **PASS** — 21 suites, **140** tests |
| Funnel (targeted) | `yarn test:int -- hardening-funnel` | **PASS** — 1 suite, 1 test |

## Riscos residuais

1. **Repo-wide lint `no-explicit-any`** — dívida transversal em repositórios; fora do escopo de hardening.
2. **Nightly reconcile scheduler** — endpoint manual `POST /search/reconcile` entregue (E20); cron/job runner deferred.

### Resolvidos em E22–E25 (não mais residual)

1. Async SQS domain consumers (E22)
2. Atlas Search lexical / `ISearchEngine` (E25)
3. Auto-publish on verification approval (E23)
4. ActorContext ownership HTTP (E24)

## Verdict

**PASS_WITH_RISKS**

Justificativa: funil hardening verde, int/unit verdes, artefatos E22–E25 presentes. Riscos aceitos: lint repo-wide + nightly reconcile scheduler.

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | E26 VERIFY | COMPLETED |

## Pendências e bloqueios
- none (riscos aceitos listados acima)

## Impactos nos próximos loops
- Hygiene: mass-fix `@typescript-eslint/no-explicit-any` em repositórios
- Ops: nightly job para `POST /search/reconcile` (ou equivalente interno)

## Resultado final
Phase 1 hardening (E22–E25) encerrada com verdict **PASS_WITH_RISKS**; evidência em `docs/specs/phase1-mvp/qa-report.md`.

# Ledger — Loop E21: Phase 1 integration VERIFY

## Status
COMPLETED

## Objetivo
Fechar a Phase 1 (entity-first E01–E20) com evidência de integração: suite int, lint, spot-check de wiring/contratos/pureza de domain services, inventário e lista de deferrals.

## Inventário de entidades / loops COMPLETED

| Loop | Entidade / entrega | Status |
|------|-------------------|--------|
| E01 | category | COMPLETED |
| E02 | service (taxonomy) | COMPLETED |
| E03 | user | COMPLETED |
| E04 | profile | COMPLETED |
| E05 | category-attribute-schema | COMPLETED |
| E06 | product | COMPLETED |
| E07 | price-history | COMPLETED |
| E08 | listing | COMPLETED |
| E09 | listing-event | COMPLETED |
| E10 | verification-case | COMPLETED |
| E11 | evidence-item | COMPLETED |
| E12 | seal | COMPLETED |
| E13 | trust-event | COMPLETED |
| E14 | trust-score | COMPLETED |
| E15 | seller-level | COMPLETED |
| E16 | search-document | COMPLETED |
| E17 | synonym | COMPLETED |
| E18 | query-log | COMPLETED |
| E19 | favorite | COMPLETED |
| E20 | search reconciliation | COMPLETED |

Foundation 01–07 + EC também COMPLETED (ver INDEX).

## Contagens da suíte de testes

| Suite | Command | Result |
|-------|---------|--------|
| Integration | `yarn test:int` | **PASS** — 40 suites, **101** tests |
| Unit | `yarn test:unit` | **PASS** — 5 suites, **7** tests |
| Reconcile (targeted) | `yarn test:int -- search-reconcile` | **PASS** — 1 suite, 1 test |

## Spot-checks

| Check | Result | Evidence |
|-------|--------|----------|
| E01–E19 modules wired in `app.ts` | PASS | Controllers: Identity, Catalog, Listings, Verification, Trust, Search, Favorites |
| `service.yaml` main routes | PASS | `/categories`, `/services`, `/products`, `/listings`, `/verification-cases`, `/seals`, `/trust-*`, `/search`, `/search/reconcile`, `/synonyms`, `/favorites`, `/users`, `/profiles` |
| Domain services sem mongoose | PASS | `rg` em `src/domain/**/*.service.ts` sem imports mongoose/`*Model` |
| Lint nos arquivos E20 | PASS | `eslint` nos arquivos tocados — 0 errors |
| `yarn lint` (repo inteiro) | FAIL (pré-existente) | 89 errors `@typescript-eslint/no-explicit-any` em `catch (error: any)` de repositórios; **nenhum** nos arquivos E20 |

## Known deferred items

1. **Async SQS consumers** — infra `sqs-event-consumer` existe; consumers de domínio por evento ainda não fecham o loop assíncrono completo (Phase 1 usa sync publish-after-commit + reconcile).
2. **OpenSearch / Atlas Search** — busca lexical P1 em Mongo (`search_documents`); OpenSearch deferred P2/P3.
3. **Auto-publish on verification** — aprovação de verification-case não publica listing automaticamente; publish permanece ação explícita do seller/backoffice.
4. **ActorContext ownership** — tipo `IActorContext` no shared kernel existe; ownership rules em services (seller edits own listing etc.) ainda não estão aplicados de ponta a ponta nos handlers HTTP (DEC-070 parcial).
5. **Nightly reconcile scheduler** — endpoint manual `POST /search/reconcile` entregue (E20); cron/job runner deferred.
6. **Repo-wide lint `no-explicit-any`** — dívida técnica transversal nos repositórios; fora do escopo E20/E21.

## Verdict

**PASS_WITH_RISKS**

Justificativa: suíte int/unit verde, wiring e contratos OK, reconciliação E20 verde, domain services limpos de mongoose. Riscos aceitos: lint repo-wide pré-existente + deferrals listados (async consumers, OpenSearch, auto-publish, ActorContext ownership, scheduler).

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | E20 + E21 VERIFY | COMPLETED |

## Resultado final
Phase 1 entity-first encerrada com verdict PASS_WITH_RISKS; evidência em `docs/specs/phase1-mvp/qa-report.md`.

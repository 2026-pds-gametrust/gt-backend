# `AGENTS.md` – st-node-boilerplate

Contrato curto para agentes. Detalhes de camadas: [`docs/architecture-and-layers.md`](docs/architecture-and-layers.md). Specs de feature: [`docs/specs/`](docs/specs/README.md). Kit Cursor: [`.cursor/RULES.md`](.cursor/RULES.md), [`.cursor/SPECS.md`](.cursor/SPECS.md).

---

## Project context

Backend Node.js / TypeScript (Express + MongoDB). Pastas fixas: **`infraestructure`** (com “e”) e **`configuration`** (singular).

**Use case** = método em `*Service` (ex.: `createUser`), não classe `*UseCase`.

---

## Architecture (summary)

| Layer | Path | Responsibility |
|-------|------|----------------|
| Domain | `src/domain/<ctx>/` | Entities, `I*`, service, repo **contracts**, messaging interfaces |
| Application | `src/application/controllers/` | Thin HTTP controllers |
| Infraestructure | `src/infraestructure/` | Mongo `IM*`, adapters, repo **impl**, external services |
| Configuration | `src/configuration/factory/` | DI / factories only |
| Contracts | `src/contracts/service.yaml` | OpenAPI |
| Tests | `src/__tests__/` | `*.unit.test.ts` / `*.int.test.ts` |

**Golden rule:** Domain must not import Infraestructure (no Mongoose, `IM*`, concrete Kafka).

Business rules (uniqueness, 404/409, flows) live in **Service**. Repositories return `null` when not found; no product 404/409 in repos.

Reference implementation: `src/domain/user/`, `src/application/controllers/user.controller.ts`, `src/infraestructure/repository/user/`, `src/configuration/factory/user.*.factory.ts`.

---

## Naming

| Kind | Prefix / pattern | Example |
|------|------------------|---------|
| Domain interface | `I*` | `IUser`, `IUserRepositoryRead` |
| Mongo model | `IM*` | `IMUser` |
| Enum | `E*` string enum `KEY = 'KEY'` | `EUserStatus` |
| Files | kebab + role | `user.service.ts`, `user.repository.read.ts` |

---

## Commands

| Task | Command |
|------|---------|
| Install | `yarn` |
| Unit + integration | `yarn test` |
| Coverage (≥ 80%) | `yarn test:coverage` |
| Lint | `yarn lint` / `yarn lint:fix` |
| Format | `yarn prettier` |

---

## Non-negotiable rules

- Controllers: extract `req` → call service → status/JSON; `handleTranslatedError` + `ErrorCatalog`; no business rules / no `*Model`.
- New/changed HTTP routes → update `src/contracts/service.yaml`.
- Wire via factories; register controllers in bootstrap (`src/app.ts`) when needed.
- Do not invent folder spellings (`infrastructure`, `configurations`).
- Do not commit secrets (`.env`, credentials).
- Do not add AI/IDE attribution to commits or PRs (`Made with Cursor`, `Generated with Cursor`, similar trailers) — [rule.git-no-ai-attribution.mdc](.cursor/rules/rule.git-no-ai-attribution.mdc).
- Features: prefer Spec-Driven flow ([`.cursor/SPECS.md`](.cursor/SPECS.md)) — requirements approved before implement.

---

## Spec-Driven (features)

1. `agt-product-owner` → `docs/specs/<slug>/requirements.md`
2. **Human approves** requirements (explicit `APPROVED`)
3. `agt-architecture` → `design.md` (+ `tasks.md` via `@skill-spec-driven`)
4. `agt-quality-assurance` (PLAN) → `test-plan.md` before dev
5. `agt-dev-backend` → implement against `tasks.md`
6. `agt-test-runner` → suite healthy
7. `agt-code-review` → spec ↔ code findings
8. `agt-quality-assurance` (AUTOMATE + VERIFY) → `qa-report.md`
9. Reviews + `agt-verifier`
10. `agt-github-workflow` only if user asks for commit/PR

Orchestrator: `agt-orchestrator`. Fluxo completo: [`.cursor/WORKFLOW.md`](.cursor/WORKFLOW.md). Skip SDD for trivial renames/typos.

---

## Definition of Done

- Acceptance criteria met (and reflected in tests when behavior changed)
- Relevant unit/integration tests green
- `yarn lint` clean on touched code
- OpenAPI updated when HTTP contract changed
- Spec folder updated when the change was feature-scoped
- No secrets in the diff

---

## Messaging (Kafka) — when adding

1. Interface in `src/domain/<ctx>/messaging/<event>/`
2. Impl in `src/infraestructure/messaging/<event>/`
3. Inject interface into service; wire in factory
4. Follow [`skill-kafka-messaging`](.cursor/skills/skill-kafka-messaging/SKILL.md)

---

## Agent entry points

| Need | Agent / doc |
|------|-------------|
| End-to-end feature | `agt-orchestrator` |
| Specs / PO / QA | [`.cursor/SPECS.md`](.cursor/SPECS.md) |
| Technical design (`design.md`) | `agt-architecture` |
| Test plan / QA report | `agt-quality-assurance` (PLAN / AUTOMATE / VERIFY) |
| Spec ↔ code review | `agt-code-review` |
| Quality / REST naming | [`.cursor/QUALITY.md`](.cursor/QUALITY.md) |
| Commits / PR | [`.cursor/GITHUB.md`](.cursor/GITHUB.md) |
| Jira | [`.cursor/JIRA.md`](.cursor/JIRA.md) |

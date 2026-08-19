# Documentation

Published documentation for the **GamerTrust backend** (`gt-backend`).

- [English](#english)
- [Português (Brasil)](#português-brasil)

---

## English

English is **normative** for identifiers, HTTP paths, and `ARCH-*` / `DEC-*`. If the two copies diverge, English wins. Product terms: [glossary](./en/architecture/glossary.md).

| | |
|--|--|
| Project home | [en/](./en/) |
| HTTP API | [en/api/](./en/api/) |
| Communication (sync vs events) | [en/architecture/communication.md](./en/architecture/communication.md) |
| Messaging (SNS/SQS) | [en/architecture/messaging.md](./en/architecture/messaging.md) |
| Architecture canon (`ARCH-*` / `DEC-*`) | [architecture/](./architecture/) |
| Entity catalog | [entities/](./entities/) |
| DeepWiki | [`.devin/wiki.json`](../.devin/wiki.json) |

### What lives where

| Surface | Path | Audience |
|---------|------|----------|
| Project docs | [`en/`](./en/) · [`pt-BR/`](./pt-BR/) | Humans onboarding, frontend, backend |
| HTTP API (generated) | [`en/api/`](./en/api/) · [`pt-BR/api/`](./pt-BR/api/) | API consumers |
| Architecture canon | [`architecture/`](./architecture/) | Agents and reviewers citing `ARCH-*` / `DEC-*` |
| Entity catalog | [`entities/`](./entities/) | Domain authors |
| DeepWiki | [`.devin/wiki.json`](../.devin/wiki.json) | AI wiki + chat (English, generated from code) |

### Not published (working artifacts)

Do not treat these as product docs. They are not mirrored EN / pt-BR:

- [`specs/`](./specs/) — Spec-Driven Development (`requirements.md`, `design.md`, …)
- [`ralph/`](./ralph/) — loop ledgers
- [`audits/`](./audits/) — time-boxed audits
- Kit / agents: [`AGENTS.md`](../AGENTS.md), [`.cursor/`](../.cursor/)

The former frontend dump [`frontend-api/`](./frontend-api/) redirects to `en/api` and `pt-BR/api`.

### How to regenerate the API docs

```bash
yarn docs:api
```

Source of truth: [`src/contracts/service.yaml`](../src/contracts/service.yaml). After changing a route, update the YAML, then regenerate.

### DeepWiki

Steering file: [`.devin/wiki.json`](../.devin/wiki.json). After committing it, regenerate the wiki in Devin (private repos) or at [deepwiki.com](https://deepwiki.com/) (public repos). See [en/contributing.md](./en/contributing.md#deepwiki).

---

## Português (Brasil)

O inglês é **normativo** para identificadores, paths HTTP e IDs `ARCH-*` / `DEC-*`. Se as duas cópias divergirem, o inglês vence. Termos de produto: [glossário](./pt-BR/architecture/glossary.md).

| | |
|--|--|
| Home do projeto | [pt-BR/](./pt-BR/) |
| API HTTP | [pt-BR/api/](./pt-BR/api/) |
| Comunicação (sync vs eventos) | [pt-BR/architecture/communication.md](./pt-BR/architecture/communication.md) |
| Mensageria (SNS/SQS) | [pt-BR/architecture/messaging.md](./pt-BR/architecture/messaging.md) |
| Canon de arquitetura (`ARCH-*` / `DEC-*`) | [architecture/](./architecture/) |
| Catálogo de entidades | [entities/](./entities/) |
| DeepWiki | [`.devin/wiki.json`](../.devin/wiki.json) |

### O que fica onde

| Superfície | Caminho | Público |
|------------|---------|---------|
| Docs de projeto | [`en/`](./en/) · [`pt-BR/`](./pt-BR/) | Onboarding, frontend, backend |
| API HTTP (gerada) | [`en/api/`](./en/api/) · [`pt-BR/api/`](./pt-BR/api/) | Consumidores da API |
| Canon de arquitetura | [`architecture/`](./architecture/) | Agents e review citando `ARCH-*` / `DEC-*` |
| Catálogo de entidades | [`entities/`](./entities/) | Autores de domínio |
| DeepWiki | [`.devin/wiki.json`](../.devin/wiki.json) | Wiki + chat (inglês, gerado do código) |

### Não publicado (artefatos de trabalho)

Não trate isto como doc de produto. Não há espelho EN / pt-BR:

- [`specs/`](./specs/) — Spec-Driven Development (`requirements.md`, `design.md`, …)
- [`ralph/`](./ralph/) — ledgers de loop
- [`audits/`](./audits/) — auditorias pontuais
- Kit / agents: [`AGENTS.md`](../AGENTS.md), [`.cursor/`](../.cursor/)

O dump antigo [`frontend-api/`](./frontend-api/) redireciona para `en/api` e `pt-BR/api`.

### Como regenerar a doc da API

```bash
yarn docs:api
```

Fonte de verdade: [`src/contracts/service.yaml`](../src/contracts/service.yaml). Depois de mudar uma rota, atualize o YAML e regenere.

### DeepWiki

Arquivo de direção: [`.devin/wiki.json`](../.devin/wiki.json). Depois do commit, regenere o wiki no Devin (repos privados) ou em [deepwiki.com](https://deepwiki.com/) (públicos). Ver [pt-BR/contributing.md](./pt-BR/contributing.md#deepwiki).

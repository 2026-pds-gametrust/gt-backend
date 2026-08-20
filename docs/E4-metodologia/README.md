# Entrega 4 — Metodologia / Materiais e Métodos

Atividade 05 · Aula 16 · Projeto e Desenvolvimento de Sistemas (IFPR) · 10%.

## Status

| Item | Situação |
|------|----------|
| Capítulo 3 — Metodologia | ✅ [projeto.md](./projeto.md) |
| Diagramas (`.drawio` + SVG + PNG) | ✅ [`diagramas/`](../../diagramas/) |
| README da raiz apontando esta entrega | ✅ |

## O que está nesta pasta

| Arquivo | Papel |
|---------|--------|
| [projeto.md](./projeto.md) | Capítulo 3 completo (Nível A): processo, materiais e arquitetura |
| Este README | Índice da entrega e links dos repositórios |

O texto em `projeto.md` está pronto para colar no **Template Final** (ABNT). No Git a fonte da verdade é este Markdown.

## Repositórios (divisão backend / frontend-web)

A solução foi desenvolvida em **dois repositórios**, com contrato HTTP compartilhado:

| Parte | Repositório | Papel |
|-------|-------------|--------|
| **Backend** | [github.com/gametrustt/gt-backend](https://github.com/gametrustt/gt-backend) | API REST, regras de negócio, persistência, eventos, chat em tempo real |
| **Frontend-web** | [github.com/2026-pds-gametrust/gt-web-front](https://github.com/2026-pds-gametrust/gt-web-front) | Canal web (React): descoberta, anúncio, venda, verificação, chat |

**Link para o AVA (este repositório):** https://github.com/gametrustt/gt-backend

## Diagramas

| Arquivo | Conteúdo |
|---------|----------|
| [`diagramas/arquitetura-gamertrust.drawio`](../../diagramas/arquitetura-gamertrust.drawio) | Fonte editável (draw.io) — duas abas |
| [`diagramas/arquitetura-solucao.svg`](../../diagramas/arquitetura-solucao.svg) / `.png` | Visão de containers (web, API, dados, mensageria) |
| [`diagramas/arquitetura-camadas.svg`](../../diagramas/arquitetura-camadas.svg) / `.png` | Camadas FSD (web) + camadas do backend + fluxo HTTP |

Abrir o `.drawio` em [app.diagrams.net](https://app.diagrams.net) ou no plugin do VS Code / Cursor.

## Organização do trabalho

A disciplina cita ClickUp como exemplo. **A equipe usou Jira + Scrum** (quadro, Stories e Subtasks, sprints). O detalhe está na seção 3.2 de [projeto.md](./projeto.md).

## Como entregar no AVA

1. Confirmar que o repositório GitHub está **público** (ou que o professor tem acesso).
2. Testar o link em aba anônima.
3. Colar no campo de envio: `https://github.com/gametrustt/gt-backend`
4. No comentário da entrega, indicar também o frontend: `https://github.com/2026-pds-gametrust/gt-web-front`

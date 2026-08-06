# Pesquisa atualizada: Cursor e Claude Code para backend

**Atualizado em 13 de julho de 2026.**

Minha principal conclusão é que o melhor padrão atual deixou de ser “escrever prompts melhores” e passou a ser **transformar o repositório em um ambiente operacional para agentes**.

Isso significa estruturar:

1. contexto permanente;
2. regras específicas por diretório;
3. procedimentos reutilizáveis;
4. agentes especializados;
5. validações determinísticas;
6. integrações controladas;
7. segurança e isolamento;
8. avaliação contínua da qualidade gerada.

Cursor e Claude Code estão convergindo para esse modelo com `AGENTS.md`, `CLAUDE.md`, Rules, Agent Skills, subagents, hooks, MCP, sandboxes e agentes executados em paralelo. ([Cursor][1])

---

## 1. O padrão mais maduro atualmente

O modelo recomendado é:

```text
Instruções permanentes
        ↓
Regras específicas por contexto
        ↓
Skills com procedimentos
        ↓
Subagents especializados
        ↓
Hooks e permissões
        ↓
MCPs e ferramentas externas
        ↓
Testes, verificação e code review
```

Cada camada resolve um problema diferente:

| Camada      | Responsabilidade                                    |
| ----------- | --------------------------------------------------- |
| `AGENTS.md` | Contexto comum, arquitetura e comandos principais   |
| `CLAUDE.md` | Adaptação do contexto para Claude Code              |
| Rules       | Padrões específicos por tecnologia ou diretório     |
| Skills      | Procedimentos repetíveis                            |
| Subagents   | Especialistas com contexto e permissões reduzidos   |
| Hooks       | Garantias determinísticas e bloqueios               |
| MCP         | Acesso a GitHub, bancos, observabilidade, Jira etc. |
| Evals/CI    | Verificação objetiva do trabalho produzido          |

A principal mudança de mentalidade é:

> **Regras descrevem fatos e restrições. Skills descrevem procedimentos. Hooks aplicam garantias. Testes comprovam o resultado.**

---

# 2. Estrutura recomendada para o repositório

Para um backend Node.js/TypeScript com Clean Architecture, DDD, Kafka, MongoDB e PostgreSQL, eu utilizaria:

```text
backend-service/
├── AGENTS.md
├── CLAUDE.md
├── REVIEW.md
│
├── docs/
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── boundaries.md
│   │   ├── event-flow.md
│   │   └── dependency-rules.md
│   ├── adr/
│   ├── api/
│   ├── events/
│   └── runbooks/
│
├── ai/
│   ├── standards/
│   │   ├── architecture.md
│   │   ├── typescript.md
│   │   ├── testing.md
│   │   ├── kafka.md
│   │   ├── mongodb.md
│   │   ├── postgresql.md
│   │   ├── observability.md
│   │   └── security.md
│   │
│   ├── skills/
│   │   ├── create-endpoint/
│   │   ├── create-use-case/
│   │   ├── create-kafka-consumer/
│   │   ├── create-kafka-producer/
│   │   ├── create-integration-test/
│   │   ├── investigate-incident/
│   │   ├── review-pull-request/
│   │   └── create-adr/
│   │
│   ├── agents/
│   ├── evals/
│   └── fixtures/
│
├── .cursor/
│   └── rules/
│       ├── architecture.mdc
│       ├── domain.mdc
│       ├── application.mdc
│       ├── infrastructure.mdc
│       ├── kafka.mdc
│       └── testing.mdc
│
├── .claude/
│   ├── rules/
│   ├── skills/
│   ├── agents/
│   ├── hooks/
│   └── settings.json
│
├── scripts/
│   ├── ai/
│   │   ├── validate-boundaries.sh
│   │   ├── validate-generated-code.sh
│   │   ├── validate-migrations.sh
│   │   └── sync-agent-configs.sh
│   └── ci/
│
├── src/
├── tests/
└── package.json
```

A pasta `ai/` funciona como fonte independente de fornecedor. Um script pode sincronizar esses padrões para Cursor, Claude Code e, futuramente, Copilot, Codex ou Gemini CLI.

---

# 3. `AGENTS.md` como contrato central

O Cursor suporta Rules persistentes e `AGENTS.md`. O Claude Code lê `CLAUDE.md`, mas a própria documentação da Anthropic recomenda importar o `AGENTS.md` para evitar duplicação. ([Cursor][1])

Seu `CLAUDE.md` pode ser mínimo:

```md
@AGENTS.md

## Claude Code

- Use plan mode antes de alterar mais de três arquivos.
- Para tarefas complexas, delegue exploração e revisão a subagents.
- Não altere testes de aceitação para fazer a implementação passar.
```

O `AGENTS.md` deve permanecer pequeno e objetivo. A Anthropic recomenda mirar em menos de 200 linhas por arquivo; arquivos grandes gastam contexto e reduzem a aderência. A orientação oficial do GitHub também observa que arquivos extensos, especialmente acima de aproximadamente mil linhas, geram comportamento inconsistente. ([Claude Platform Docs][2])

## Conteúdo recomendado

```md
# Project Context

Backend responsável por gerenciamento de appointments.

## Architecture

- TypeScript.
- Clean Architecture.
- Domain não depende de frameworks.
- Application depende apenas de Domain e portas.
- Infrastructure implementa portas.
- Controllers não contêm regras de negócio.

## Commands

- Install: `pnpm install`
- Type check: `pnpm typecheck`
- Unit tests: `pnpm test`
- Integration tests: `pnpm test:integration`
- Lint: `pnpm lint`
- Build: `pnpm build`

## Non-negotiable rules

- Nunca utilizar `any` sem justificativa documentada.
- Novos endpoints exigem teste de integração.
- Novos consumers devem implementar idempotência.
- Valores monetários devem ser representados em centavos.
- Não alterar contratos públicos sem registrar impacto.
- Não acessar MongoDB ou PostgreSQL diretamente na camada de domínio.

## Definition of Done

- Critérios de aceitação atendidos.
- Testes relevantes criados.
- Lint, typecheck e build aprovados.
- Observabilidade adicionada.
- Documentação atualizada quando necessário.
- Nenhum segredo ou credencial incluído.
```

Não coloque explicações extensas, tutoriais ou checklists procedurais nesse arquivo. Esses itens pertencem a Skills.

---

# 4. Rules específicas por contexto

Tanto Cursor quanto Claude Code permitem modularizar regras. No Claude Code, arquivos em `.claude/rules/` podem ser específicos por caminho, carregando apenas quando o agente trabalha nos arquivos correspondentes. Isso reduz ruído e consumo de contexto. ([Claude Platform Docs][2])

Exemplo de divisão:

```text
architecture.md
typescript.md
testing.md
api-contracts.md
kafka.md
mongodb.md
postgresql.md
observability.md
security.md
```

## Exemplo: regra para Kafka

```md
# Kafka conventions

Aplica-se a consumers, producers e event handlers.

- Todo consumer deve ser idempotente.
- A chave da mensagem deve representar o agregado principal.
- Não assumir ordenação entre partições.
- Registrar `messageType`, `correlationId`, `eventId` e duração.
- Validar o contrato antes de executar o handler.
- Erros transitórios devem permitir retry.
- Erros de contrato devem ser enviados para tratamento específico.
- Não confirmar offset antes de concluir a operação necessária.
- Testar mensagens duplicadas, inválidas e fora de ordem.
```

## Exemplo: regra para testes

Como você prefere `describe = when` e `it = should`, isso deve ser explícito:

```md
# Testing conventions

- `describe` deve representar o contexto usando `when`.
- `it` deve representar o comportamento usando `should`.
- Testes unitários não devem acessar infraestrutura.
- Testes de integração devem utilizar dependências reais em containers.
- Não utilizar sleeps para aguardar processamento assíncrono.
- Não alterar expectativas apenas para fazer o teste passar.
```

---

# 5. Skills: a tecnologia mais importante para padronização

Agent Skills se consolidaram como um padrão aberto e reutilizável entre ferramentas. Claude Code utiliza arquivos `SKILL.md`, carregando o conteúdo apenas quando a Skill é usada. Cursor também passou a suportar Agent Skills como padrão aberto. ([Claude Platform Docs][3])

Esse carregamento sob demanda é uma evolução importante: evita colocar procedimentos longos em `AGENTS.md` ou `CLAUDE.md`.

## Skills que fazem sentido para seu backend

### `create-use-case`

Responsável por:

* localizar o agregado;
* identificar portas necessárias;
* criar DTOs;
* implementar o caso de uso;
* mapear erros;
* criar testes unitários;
* validar dependências entre camadas.

### `create-kafka-consumer`

Responsável por:

* localizar contratos de eventos;
* criar ou atualizar o schema;
* registrar o `messageType`;
* implementar idempotência;
* criar handler;
* adicionar métricas;
* criar teste de integração;
* testar duplicidade e retry.

### `create-endpoint`

Responsável por:

* validar o contrato;
* criar controller;
* criar schema;
* chamar caso de uso;
* mapear erros HTTP;
* atualizar OpenAPI;
* criar teste de integração.

### `investigate-incident`

Responsável por:

1. reunir logs e traces;
2. reconstruir a timeline;
3. identificar hipótese;
4. localizar código relacionado;
5. criar teste reprodutível;
6. confirmar a causa raiz;
7. implementar correção;
8. validar ausência de regressão;
9. produzir resumo do incidente.

### `review-pull-request`

Responsável por revisar:

* violação de boundaries;
* erros de concorrência;
* idempotência;
* contratos;
* queries ineficientes;
* observabilidade;
* segurança;
* cobertura de cenários;
* alterações incompatíveis.

---

# 6. Subagents especializados

Subagents não devem ser apenas “personas”. Eles precisam ter:

* objetivo limitado;
* contexto próprio;
* conjunto reduzido de ferramentas;
* modelo adequado;
* critérios claros de conclusão;
* memória apenas quando realmente útil.

Claude Code permite configurar nome, descrição, modelo, ferramentas, hooks e memória persistente por subagent. A documentação recomenda memória com escopo de projeto como padrão quando o conhecimento precisa ser compartilhado pelo time. ([Claude Platform Docs][4])

Para backend, começaria com cinco:

## `architecture-reviewer`

Somente leitura.

Verifica:

* dependências entre camadas;
* acoplamento indevido;
* responsabilidades;
* compatibilidade com decisões arquiteturais;
* impacto em outros serviços.

## `test-engineer`

Pode ler, editar testes e executar comandos de validação.

Verifica:

* happy path;
* edge cases;
* concorrência;
* idempotência;
* integração;
* regressões.

## `eventing-specialist`

Especialista em Kafka:

* particionamento;
* consumer groups;
* retries;
* duplicidade;
* ordenação;
* schemas;
* DLQ;
* outbox.

## `database-reviewer`

Especialista em:

* índices;
* planos de execução;
* paginação;
* transações;
* agregações;
* N+1;
* concorrência;
* migrations.

## `security-reviewer`

Somente leitura inicialmente.

Verifica:

* autorização;
* exposição de dados;
* validação de entrada;
* injeção;
* SSRF;
* segredos;
* permissões;
* dependências vulneráveis.

Evite criar dezenas de agentes. O custo de coordenação e a fragmentação do contexto começam a superar o ganho. Use paralelismo principalmente quando as investigações forem independentes.

---

# 7. Hooks: regras que não podem depender da “boa vontade” do modelo

Instruções são probabilísticas. Hooks e permissões são determinísticos.

Use hooks para:

* impedir leitura de `.env`;
* bloquear alterações em migrations já executadas;
* impedir comandos destrutivos;
* executar formatter após edição;
* executar typecheck em arquivos TypeScript alterados;
* validar boundaries arquiteturais;
* verificar secrets;
* impedir acesso ao cluster de produção;
* registrar auditoria do agente.

Claude Code alerta que hooks executam com as permissões completas do usuário e recomenda sanitização de entradas, uso de caminhos absolutos, bloqueio de path traversal e exclusão de arquivos sensíveis. ([Claude Platform Docs][5])

Exemplo de lógica conceitual:

```text
PreToolUse:
    se comando contém kubectl e contexto é production:
        bloquear

    se arquivo é .env ou credencial:
        bloquear

PostToolUse:
    se arquivo alterado termina em .ts:
        executar eslint no arquivo

Stop:
    executar:
        pnpm typecheck
        pnpm lint
        pnpm test
```

Não use hook como única camada de autorização. Para bloqueios rígidos, combine:

* permissões;
* sandbox;
* credenciais limitadas;
* ambiente isolado;
* hook;
* CI.

---

# 8. MCP: acesso governado ao contexto externo

MCP tornou-se o protocolo principal para conectar agentes a dados e ferramentas externas. Ele diferencia Resources, Prompts e Tools, permitindo que o agente consulte informações ou execute ações com contratos estruturados. ([Model Context Protocol][6])

Para seu cenário, MCPs úteis seriam:

* GitHub;
* Jira ou Linear;
* MongoDB somente leitura;
* PostgreSQL somente leitura;
* New Relic;
* CloudWatch;
* Kafka/Confluent;
* documentação interna;
* OpenAPI;
* catálogo de eventos;
* Feature Flags;
* AWS, com permissões extremamente restritas.

## Recomendação importante

Não entregue acesso irrestrito diretamente ao banco.

Crie ferramentas específicas:

```text
get_collection_schema
explain_mongodb_query
list_database_indexes
explain_postgres_query
get_consumer_lag
get_recent_service_errors
get_trace_by_correlation_id
get_event_contract
```

Isso é melhor que uma ferramenta genérica como:

```text
execute_any_query
run_any_aws_command
execute_shell_remotely
```

A Claude Code permite restringir ferramentas MCP por agente, Skill, hook e regras de permissão. Plugins também podem empacotar MCP, Skills, agentes e hooks. ([Claude Platform Docs][7])

---

# 9. Fluxo de desenvolvimento recomendado

## Etapa 1 — Exploração

O agente deve primeiro responder:

* quais módulos serão afetados;
* onde estão regras semelhantes;
* quais contratos existem;
* quais testes cobrem o comportamento;
* quais riscos foram identificados;
* quais dúvidas permanecem.

Nenhum código deve ser alterado nessa etapa.

## Etapa 2 — Plano

Use o Plan Mode para tarefas que envolvam:

* mudança arquitetural;
* mais de três ou quatro arquivos;
* banco de dados;
* eventos;
* concorrência;
* contratos públicos;
* mais de um serviço.

Cursor possui Plan Mode próprio para pesquisar o codebase e produzir um plano revisável antes da implementação. ([Cursor][8])

## Etapa 3 — Teste reprodutível

Para bugs:

1. criar teste que reproduz o erro;
2. executar e confirmar falha;
3. implementar correção;
4. executar novamente;
5. garantir que o teste não foi enfraquecido.

Para features:

1. transformar critérios de aceitação em testes;
2. confirmar que falham pelo motivo correto;
3. implementar o menor slice funcional;
4. iterar até passar.

A recomendação oficial do Cursor para TDD também separa criação dos testes, confirmação da falha e implementação, proibindo o agente de modificar os testes para obter sucesso artificial. ([Cursor][9])

## Etapa 4 — Implementação vertical

Em vez de pedir:

> Implemente todo o módulo de appointments.

Divida em slices:

```text
1. contrato e entidade;
2. caso de uso;
3. persistência;
4. endpoint;
5. evento;
6. integração;
7. observabilidade.
```

Cada slice deve terminar em estado compilável e testável.

## Etapa 5 — Verificação

O agente deve apresentar evidências:

```text
Typecheck: aprovado
Lint: aprovado
Unit tests: 143 aprovados
Integration tests: 27 aprovados
Build: aprovado
Arquivos alterados: 8
Testes adicionados: 6
Contratos modificados: nenhum
Riscos restantes: ...
```

Claude Code adicionou Skills como `/run` e `/verify`, voltadas a executar a aplicação e confirmar o comportamento real, não apenas confiar em testes e typecheck. ([Claude Platform Docs][3])

## Etapa 6 — Revisão independente

O agente que implementou não deve ser o único revisor.

Execute agentes independentes para:

* arquitetura;
* testes;
* segurança;
* banco/eventos, quando aplicável.

Claude Code também passou a suportar `REVIEW.md`, com instruções exclusivas para revisão e prioridade superior ao contexto geral. ([Claude Platform Docs][10])

---

# 10. Template de tarefa para Cursor ou Claude Code

O melhor prompt não precisa ser gigantesco. Precisa funcionar como uma task técnica bem refinada:

```md
## Objetivo

Armazenar no appointment o identificador do operador que realizou o agendamento
no backoffice.

## Contexto

Quando o appointment muda para SCHEDULED, precisamos registrar quem executou
essa ação para métricas operacionais e produtividade.

## Escopo

- Alterar apenas o contexto de appointment.
- Não criar um novo serviço.
- Não alterar contratos públicos sem necessidade.
- Não implementar o dashboard de produtividade nesta tarefa.

## Regras

- O identificador deve representar o usuário autenticado no backoffice.
- O campo deve ser preenchido na transição para SCHEDULED.
- Atualizações posteriores não devem sobrescrevê-lo inadvertidamente.
- A operação deve continuar idempotente.
- Alterações de status devem continuar auditáveis.

## Critérios de aceitação

- Appointment armazena o responsável pelo agendamento.
- O valor é persistido ao entrar em SCHEDULED.
- O valor não é aceito diretamente do body quando puder ser obtido do token.
- Existem testes unitários e de integração.
- OpenAPI e contratos internos são atualizados quando necessário.

## Processo obrigatório

1. Analise a implementação atual.
2. Apresente os arquivos afetados.
3. Produza um plano.
4. Crie ou atualize os testes.
5. Implemente.
6. Execute lint, typecheck e testes.
7. Apresente evidências.
```

---

# 11. Novas tecnologias e tendências relevantes em 2026

## 11.1 Agent Skills portáveis

Skills estão se tornando uma unidade reutilizável entre Claude Code, Cursor, GitHub Copilot e outros agentes. Em vez de manter prompts soltos, times passam a versionar procedimentos, scripts, templates e referências como código. ([Claude Platform Docs][3])

**Prioridade: muito alta.**

## 11.2 Subagents com memória especializada

Subagents agora podem acumular conhecimento específico do projeto, como padrões arquiteturais, problemas recorrentes e áreas sensíveis do sistema. ([Claude Platform Docs][4])

**Prioridade: alta**, especialmente para review e investigação.

## 11.3 Hooks e policy-as-code

Cursor e Claude Code estão ampliando hooks para observar e controlar prompts, ferramentas, subagents, respostas e encerramento de sessões. Isso permite criar loops de autocorreção, auditoria e enforcement. ([Cursor][11])

**Prioridade: muito alta** para times.

## 11.4 Cloud agents e automações

Cursor Automations permite disparar agentes por horário ou eventos de GitHub, Linear, Slack e PagerDuty. Os agentes executam em sandbox, utilizam MCPs e verificam o próprio resultado. ([Cursor][12])

Casos interessantes:

* investigar incidente do PagerDuty;
* atualizar documentação após merge;
* revisar migrations;
* corrigir dependências vulneráveis;
* analisar consumer lag;
* criar relatório de flaky tests;
* abrir PR para atualização de contratos.

**Prioridade: média inicialmente**, alta depois que regras e testes estiverem maduros.

## 11.5 Multi-agent com worktrees

Cursor passou a permitir múltiplos agentes em paralelo usando worktrees ou ambientes remotos, evitando que agentes alterem a mesma árvore de trabalho. ([Cursor][13])

Boa aplicação:

```text
Agent 1: investigar arquitetura
Agent 2: analisar testes
Agent 3: analisar segurança
Agent 4: analisar banco e performance
```

Não é recomendado dividir uma única implementação fortemente acoplada entre muitos agentes.

## 11.6 Sandboxing e least privilege

O uso seguro está migrando de “aprovar comandos individualmente” para sandboxes com limites explícitos de filesystem e rede. Claude Code permite configurar caminhos de escrita, caminhos proibidos, domínios permitidos e comandos excluídos. ([Claude Platform Docs][14])

**Prioridade: obrigatória** para adoção corporativa.

## 11.7 Model routing

Para Claude Code, minha divisão prática seria:

* **Sonnet 5:** implementação diária, testes, debugging e tarefas de médio porte;
* **Opus 4.7:** arquitetura, concorrência, migrações complexas, investigação profunda e revisão crítica.

A Anthropic lançou Sonnet 5 em 30 de junho de 2026, destacando execução sustentada, tool use e debugging; Opus 4.7 foi apresentado com ganhos em tarefas longas, planejamento, qualidade de testes e resolução de problemas de produção. ([Anthropic][15])

O princípio mais importante é não utilizar sempre o modelo mais caro. Use modelos rápidos para execução previsível e modelos de raciocínio profundo nos pontos de maior risco.

---

# 12. Antipadrões que devem ser evitados

## Um único arquivo de regras gigantesco

Provoca desperdício de contexto, conflitos e menor aderência.

## Misturar fatos, procedimentos e tarefas

* fatos e constraints → Rules;
* procedimentos → Skills;
* trabalho atual → prompt da tarefa.

## Liberar acesso irrestrito

Nunca forneça por padrão:

* credenciais de produção;
* `kubectl` de produção;
* escrita em bancos;
* acesso completo à AWS;
* Docker socket;
* shell remoto.

## Aceitar o “funcionou” do agente

Exija saída dos comandos, testes reproduzíveis e diff revisável.

## Permitir alteração de testes sem justificativa

O agente pode tornar o teste mais fraco para obter sucesso.

## Colocar lint e formatação no prompt

Esses requisitos devem estar em scripts, hooks e CI.

## Fazer implementação, segurança e review no mesmo contexto

Use uma revisão limpa ou um agente separado, sem o viés do implementador.

## Usar agentes em código sem documentação

A documentação oficial da Anthropic recomenda explicitamente investir em documentação, comandos de build e contexto arquitetural antes de ampliar a autonomia. ([Claude Platform Docs][16])

---


## Estado atual — st-node-boilerplate (jul/2026)

Este repositório **já opera** como ambiente para agentes Cursor. O texto acima é pesquisa genérica; abaixo está o mapeamento real (não copie a árvore `ai/` nem Spec Kit CLI).

### O que já existe

| Camada | Onde |
|--------|------|
| Contrato curto | [`AGENTS.md`](AGENTS.md) (~110 linhas) |
| Arquitetura | [`docs/architecture-and-layers.md`](docs/architecture-and-layers.md) |
| Specs SDD | [`docs/specs/`](docs/specs/README.md) + [`.cursor/SPECS.md`](.cursor/SPECS.md) |
| Rules (scoped) | [`.cursor/rules/`](.cursor/rules/) — always-on: `rule.project-core`, `rule.business-rules-layers` |
| Skills | [`.cursor/skills/`](.cursor/skills/) — endpoint, kafka, mongo, tests, openapi, **spec-driven**, etc. |
| Agents | [`.cursor/agents/`](.cursor/agents/) — orchestrator, PO, QA, dev, test-runner, verifier, quality, github, jira |
| Hooks | [`.cursor/hooks.json`](.cursor/hooks.json) — bloqueia `.env` e cmds destrutivos |
| Índices | [`RULES.md`](.cursor/RULES.md), [`QUALITY.md`](.cursor/QUALITY.md), [`GITHUB.md`](.cursor/GITHUB.md), [`JIRA.md`](.cursor/JIRA.md) |

### Fluxo Spec-Driven (feature)

```text
agt-product-owner → docs/specs/<slug>/requirements.md
        ↓ human gate
design.md + tasks.md (@skill-spec-driven)
        ↓
agt-dev-backend → agt-test-runner → agt-quality-assurance
        ↓
agt-architecture-review ∥ agt-code-quality → agt-verifier
        ↓ (se pedido)
agt-github-workflow
```

Orquestrador: **`agt-orchestrator`**.

### Mapa: pesquisa / Spec Kit → este repo

| Ideia na pesquisa / Spec Kit | Equivalente aqui |
|------------------------------|------------------|
| `create-use-case` | Método em `*Service` + `skill-new-context` / `skill-add-http-endpoint` |
| `create-endpoint` | `skill-add-http-endpoint` |
| `create-kafka-consumer` | `skill-kafka-messaging` |
| `review-pull-request` | `agt-code-quality` + `agt-architecture-review` + `agt-verifier` |
| `/speckit.specify` | `agt-product-owner` + `docs/specs/.../requirements.md` |
| `/speckit.plan` + `/tasks` | `@skill-spec-driven` → `design.md` / `tasks.md` |
| Planner agent | `agt-product-owner` + `agt-orchestrator` |
| Tester / QA de aceite | `agt-quality-assurance` (≠ `agt-test-runner`) |
| Reviewer | `agt-architecture-review` / `agt-code-quality` / `agt-verifier` |
| Pasta `ai/` multi-vendor | **Não** — fonte de verdade = `.cursor/` |
| Spec Kit CLI / `.specify` | **Não no MVP** — templates em `docs/specs/_templates/` |

### Roadmap residual (não bloqueante)

- Security: preferir subagent built-in do Cursor; agent dedicado só se houver dor.
- Tech-writer / incident skill: quando houver MCP de logs/observabilidade.
- `.claude/` dual stack: só se o time adotar Claude Code.
- Encolher prompts longos (`agt-verifier`, etc.) extraindo checklists para skills.

### Antipadrão local

Não tratar este `instructions.md` como source of truth de implementação. Para contribuir no código: **`AGENTS.md` + `docs/architecture-and-layers.md` + agents/skills em `.cursor/`**.

---

[1]: https://cursor.com/docs/rules?utm_source=chatgpt.com "Rules | Cursor Docs"
[2]: https://docs.anthropic.com/en/docs/claude-code/memory "How Claude remembers your project - Claude Code Docs"
[3]: https://docs.anthropic.com/en/docs/claude-code/skills "Extend Claude with skills - Claude Code Docs"
[4]: https://docs.anthropic.com/en/docs/claude-code/sub-agents "Create custom subagents - Claude Code Docs"
[5]: https://docs.anthropic.com/en/docs/claude-code/hooks "Hooks reference - Claude Code Docs"
[6]: https://modelcontextprotocol.io/specification/2025-11-25?utm_source=chatgpt.com "Specification"
[7]: https://docs.anthropic.com/en/docs/claude-code/mcp "Connect Claude Code to tools via MCP - Claude Code Docs"
[8]: https://cursor.com/docs/agent/plan-mode?utm_source=chatgpt.com "Plan Mode | Cursor Docs"
[9]: https://cursor.com/blog/agent-best-practices "Best practices for coding with agents · Cursor"
[10]: https://docs.anthropic.com/en/docs/claude-code/code-review "Code Review - Claude Code Docs"
[11]: https://cursor.com/changelog "What's New in Cursor — Latest Updates & Release Notes"
[12]: https://cursor.com/blog/automations "Build agents that run automatically · Cursor"
[13]: https://cursor.com/blog/2-0?utm_source=chatgpt.com "Introducing Cursor 2.0 and Composer"
[14]: https://docs.anthropic.com/en/docs/claude-code/settings "Claude Code settings - Claude Code Docs"
[15]: https://www.anthropic.com/news/claude-sonnet-5 "Introducing Claude Sonnet 5 \ Anthropic"
[16]: https://docs.anthropic.com/en/docs/claude-code/enterprise-setup "Enterprise deployment overview - Claude Code Docs"

# 3 METODOLOGIA

Este capítulo descreve **como** o GamerTrust foi desenvolvido: o processo de trabalho, os materiais (tecnologias e ferramentas) e os métodos (arquitetura da solução). Cada escolha é justificada pelo contexto do produto — um marketplace de eletrônicos e produtos gamer usados cujo diferencial é a **confiança verificável**, e não o volume de anúncios.

O sistema foi dividido em dois produtos de software, desenvolvidos em repositórios distintos e integrados por contrato HTTP (OpenAPI) e, no chat, por Socket.IO:

- **Backend (`gt-backend`):** API REST, regras de negócio, persistência, mensageria e tempo real.
- **Frontend-web (`gt-web-front`):** canal web para busca, comparação, publicação de anúncio, verificação, pedidos e conversa comprador–vendedor.

Aplicativos móveis existem no monorepo de produto, mas **não fazem parte desta entrega**: o recorte acadêmico é backend + frontend-web.

---

## 3.1 Abordagem de desenvolvimento

### 3.1.1 Modelo de processo

Adotou-se um processo **ágil**, com **Scrum** como quadro de gestão e entrega **iterativa-incremental**. Complementarmente, o frontend passou por uma fase de **prototipação evolutiva** (interface contra API mockada) antes da integração com o backend real.

Não se utilizou cascata. Os requisitos de um marketplace com verificação de posse, selos, TrustScore e moderação **não estavam fechados no início**: cada incremento revelou regras (ownership, estados do anúncio, evidências, chat). Congelar análise, projeto e implementação em fases sequenciais teria gerado retrabalho tardio.

O Scrum, neste projeto, não foi “cerimônia vazia”. Foi o modo concreto de fatiar o produto em incrementos utilizáveis (identidade, catálogo, anúncio, verificação, busca, chat, pedido) e de inspecionar o resultado a cada sprint.

### 3.1.2 Justificativa pelo contexto

O GamerTrust é um sistema de **tamanho médio para uma equipe acadêmica**: vários contextos de negócio (identidade, catálogo, anúncios, verificação, confiança, busca, mídia, pedidos, chat), mas um único time pequeno. Esse recorte explica três decisões de processo:

1. **Scrum em sprints curtas (cerca de uma a duas semanas).** O backlog muda quando uma regra de confiança aparece (por exemplo: anúncio só fica visível após verificação; chat não pode vazar contato externo). Sprints curtas permitem reordenar o backlog sem descartar meses de especificação.
2. **Incrementos verticais, não camadas horizontais.** Cada sprint entrega uma fatia que atravessa backend e, quando faz sentido, a tela web correspondente — e não “primeiro o banco inteiro, depois a API inteira, depois a UI”. Assim o time descobre cedo se o contrato HTTP e a regra de negócio conversam.
3. **Prototipação evolutiva no web.** O canal web começou com fixtures e `MockApi` para validar jornadas (busca, anúncio, vender) sem esperar o backend. Depois houve a troca explícita mock → API real (`VITE_API_MODE=real`). Isso é prototipação **descartável só no adaptador HTTP**, não no produto: as telas e as entidades `I*` permaneceram.

Cascata seria coerente com um sistema de requisitos legais estáveis e equipe grande com fases de homologação rígidas. Não é o caso. Prototipação *pura* (só telas, sem disciplina de contrato) também não: o backend precisa de invariantes (não inventar verificação, não vazar PII, não misturar produto de catálogo com oferta usada). O híbrido **Scrum + incremento + protótipo web evolutivo** combina com o tamanho e com o tipo do projeto.

### 3.1.3 Organização do trabalho (Jira e Scrum)

A disciplina menciona ClickUp como ferramenta-exemplo. **A equipe organizou o trabalho no Jira**, no quadro Scrum, porque já havia fluxo de **Stories** e **Subtasks**, board com colunas de ciclo de vida e rastreio de sprint. Não se descreve aqui um processo que não foi usado.

#### Papéis (adaptados ao tamanho da equipe)

Em um time pequeno, a mesma pessoa pode acumular papéis; o que se manteve foi a **separação de responsabilidades no artefato**, não a folha de cargo:

| Papel Scrum | Na prática deste projeto |
|-------------|--------------------------|
| Product Owner | Prioriza o backlog a partir do contexto de produto (personas Lucas, Beatriz, Rafael, Carlos, Camila, André) e escreve critérios de aceite. |
| Developers | Implementam o incremento no repositório da sua frente (backend **ou** frontend-web). |
| Scrum Master (leve) | Mantém o quadro no Jira, impede escopo “infinito” na sprint e garante que uma Story só entra se couber no tempo. |

Não houve time de Scrum Master dedicado. Admitir isso é coerente com o tamanho do projeto: o rito existe para reduzir caos, não para imitar uma empresa de 50 pessoas.

#### Artefatos

| Artefato | Uso |
|----------|-----|
| Product Backlog | Lista priorizada de capacidades (ex.: cadastro, publicar anúncio, código de comprovação, TrustScore, chat do anúncio). |
| Sprint Backlog | Subconjunto puxado para a sprint, quebrado em Stories e Subtasks no Jira. |
| Incremento | Código + contrato OpenAPI (backend) e/ou tela navegável (web) + testes do recorte. |

#### Eventos (o que de fato ocorreu)

| Evento | Como foi feito |
|--------|----------------|
| Sprint Planning | Escolha das Stories da sprint; quebra em Subtasks por repositório (`gt-backend` / `gt-web-front`). |
| Daily (assíncrona ou curta) | Estado do board: a fazer, em andamento, bloqueado, pronto. |
| Review | Demonstração do incremento (API via OpenAPI/docs ou jornada no web). |
| Retrospectiva (leve) | Ajustes de processo: por exemplo, não começar UI de um fluxo sem o contrato HTTP estável. |

#### Divisão backend × frontend-web

A divisão **não** é “um faz tela e o outro faz CRUD”. É uma divisão por **dono da regra**:

| Frente | Dono de | Não dono de |
|--------|---------|-------------|
| **Backend** | Invariantes de negócio, persistência, autorização/ownership, estados do anúncio, selos, TrustScore, busca, mídia, pedidos, chat servidor | Layout, tokens visuais, navegação |
| **Frontend-web** | Jornada, acessibilidade, estado de UI (Zustand), consumo do contrato, tempo real no cliente | Decidir se um anúncio “está verificado”; inventar selo ou motivo de TrustScore |

O contrato entre as frentes é o **OpenAPI** (`src/contracts/service.yaml` no backend; documentação gerada consumida no web). Uma Story de ponta a ponta típica no Jira fica assim:

1. Story de produto (ex.: “comprador inicia conversa a partir de anúncio publicado”).
2. Subtask backend: contexto `listing-chat`, rotas, serviço, testes, YAML.
3. Subtask frontend: feature `listing-chat`, páginas de inbox/thread, Socket.IO client.
4. Critério de pronto: jornada no web contra API real, sem mock para aquele fluxo.

#### Spec-Driven Development dentro da sprint (backend)

No backend, cada fatia relevante ganha pasta em `docs/specs/<feature-slug>/` **antes** do código de produção:

1. `requirements.md` — o quê / por quê / aceite (gate humano `APPROVED`).
2. `design.md` — em qual camada vive cada regra.
3. `tasks.md` — fatias implementáveis.
4. `test-plan.md` — matriz critério → teste, **antes** de implementar.
5. Código + testes Jest.
6. `qa-report.md` — evidência depois.

Isso não substitui o Scrum: é o **Definition of Ready / Definition of Done** da Story. Impede o anti-padrão de “já codificar e depois descobrir a regra”. No frontend, o equivalente são specs em `docs/specs/` do repositório web (jornadas, paridade visual, troca mock → API).

#### Exemplos de incrementos (backlog real, não fictício)

Os itens abaixo correspondem a fatias que o repositório de fato contém. Servem como evidência de processo incremental — não como cronograma inventado.

**Backend (exemplos de Stories/incrementos):** identidade e perfil; autenticação first-party (JWT + refresh); catálogo (categorias, produtos, atributos); anúncios e eventos de estado; mídia (S3); verificação, evidências e código de comprovação; selos; TrustScore e nível do vendedor; busca e reconciliação; favoritos; chat do anúncio; pedido (buy now); análise assistida de evidência.

**Frontend-web (exemplos):** app shell e navegação; home com busca dominante; resultados e filtros; página de produto (modelo) ≠ página de anúncio (oferta usada); fluxo vender; cadastro/login; favoritos e perfil; moderação; evidências e código de prova; inbox/thread de chat; checkout buy now.

---

## 3.2 Materiais

Esta seção lista a stack **item a item**, com o papel de cada tecnologia na solução e a alternativa descartada. “Usamos React” sem o porquê não descreve metodologia.

### 3.2.1 Backend (`gt-backend`)

| Tecnologia | Papel na solução | Por que esta, e não outra |
|------------|------------------|---------------------------|
| **TypeScript** | Linguagem do servidor: tipos em entidades, contratos e OpenAPI | A mesma família de tipos do web reduz atrito no contrato `I*`. JavaScript puro aumentaria erro em estados de anúncio e grupos de autorização. |
| **Node.js** | Runtime | Um único ecossistema com o frontend (npm/yarn, JSON, async). Python/Django ou Java/Spring exigiriam dois mundos na equipe pequena. |
| **Yarn** | Gerenciador de pacotes | Lockfile previsível no time; já padronizado nos dois repositórios. |
| **Express** | HTTP: rotas, middlewares, bootstrap | Maduro, suficiente para API REST. NestJS traria IoC próprio que duplicaria as factories do projeto; Fastify ganharia throughput que não é o gargalo acadêmico. |
| **OpenAPI (`service.yaml`) + `express-openapi-validator`** | Contrato HTTP como fonte da verdade; valida request/response | Sem contrato, backend e web divergem. Validar só no código esconde quebra de payload. |
| **MongoDB 7** | Banco de documentos | Anúncio, evidência e search document têm forma variável (atributos por categoria). Modelo relacional rígido (PostgreSQL + dezenas de tabelas de EAV) atrasaria o MVP sem ganho para este recorte. Replica set local para transações no documento. |
| **Mongoose** | ODM: schemas `IM*`, models | Mapeia persistência **só na infraestructure**. Acesso cru ao driver aumentaria risco de filtro mal montado. |
| **Arquitetura em camadas** (Domain, Application, Infraestructure, Configuration) | Separar regra de negócio de HTTP e de Mongo | Permite testar Service sem Express. Controller “gordo” misturaria 404/409 com status HTTP — o projeto proíbe regra de negócio no controller e no repository. |
| **JWT + refresh opaco** (emissão first-party) | Autenticação | Cognito/Auth0 terceirizam identidade e fogem do escopo acadêmico de ownership. JWT curto + refresh rotacionado atende sessão web. |
| **bcrypt** | Hash de senha | Padrão adequado a senha at-rest; senha nunca vai em log nem em evento. |
| **Helmet** | Cabeçalhos HTTP de segurança | Reduz superfície (XSS sniffing, etc.) no Express com custo baixo. |
| **CORS** | Origens permitidas (web em `:5173`) | O browser chama outra origem; CORS explícito evita “liberar `*`” em produção. |
| **express-rate-limit** | Limite de requisições (ex.: chat) | Chat e auth são alvos de abuso; limite é controle de aplicação, não “otimização”. |
| **Socket.IO** | Tempo real do chat (servidor) | Mensagem 1:1 no anúncio precisa chegar sem o cliente ficar em polling. SSE bastaria em um sentido; Socket.IO cobre rooms, reconexão e o cliente web já o usa. |
| **AWS S3** (`@aws-sdk/client-s3`) | Objetos de mídia (fotos de evidência) | Evidência não deve viver no Mongo (tamanho, privacidade). S3 + URL pré-assinada; bucket privado para evidência restrita. |
| **LocalStack + S3 em memória** | Dev local sem conta AWS | `S3_USE_MEMORY=true` e LocalStack permitem desenvolver mídia offline. |
| **SNS / SQS** (`@aws-sdk/client-sns`, `client-sqs`) | Transporte de eventos entre módulos | Módulos não se importam. Evento `listings.listing.published` alimenta busca. Kafka seria infra a mais para o tamanho do time. |
| **Jest + ts-jest + mongodb-memory-server + Supertest** | Testes unitários e de integração | Meta ≥ 80%. Mongo em memória evita Docker na suíte de integração. |
| **ESLint + Prettier + `eslint-plugin-boundaries`** | Qualidade e fronteira entre módulos | A regra “domínio A não importa domínio B” precisa falhar no `yarn lint`, não só na revisão humana. |
| **Docker Compose** | Mongo replica set + LocalStack | Reprodutibilidade do ambiente. |
| **Swagger/OpenAPI docs geradas** | Documentação HTTP bilingue | O web consome o contrato; a doc reduz “qual query string mesmo?”. |

### 3.2.2 Frontend-web (`gt-web-front`)

| Tecnologia | Papel na solução | Por que esta, e não outra |
|------------|------------------|---------------------------|
| **TypeScript** | Tipagem das entidades `I*` alinhadas ao backend | Evita UI que inventa campo de selo ou TrustScore. |
| **React 19** | UI do SPA | Catálogo, filtros, rascunho de anúncio e chat são interfaces de estado rico. Server-rendered (Next.js) ajudaria SEO, mas aumentaria complexidade (SSR, auth em cookie, hidratação) sem ser o gargalo do MVP acadêmico. |
| **Vite** | Bundler e dev server (`localhost:5173`) | Startup rápido; HMR. Webpack/CRA são mais lentos e menos atuais para projeto novo. |
| **React Router DOM** | Rotas (`/`, `/buscar`, `/produto/:id`, `/anuncio/:id`, `/vender`, auth, chat, pedidos) | SPA precisa de rotas no cliente. |
| **Zustand** | Estado por feature (auth, busca, rascunho de venda, não-lidas do chat) | Redux Toolkit seria proporcional a um app maior; Context API sozinho re-renderiza demais. Zustand cabe em `04-features/*/model`. |
| **Axios** | HTTP **somente** via `src/06-shared/lib/http` | Interceptor de `Authorization: Bearer`. Pages não montam client. `fetch` nativo exigiria reescrever interceptors e tratamento de erro. |
| **Feature-Sliced Design (FSD)** | Camadas `01-app` … `06-shared` | Espelha, no web, a disciplina de camadas do backend: página não contém regra de negócio nem Axios. |
| **Tailwind CSS 4** | Estilo utilitário + tokens | Velocidade de UI com design system próprio (`tokens.css`). CSS-in-JS (styled-components) traria runtime extra; CSS puro não escala no time. |
| **Socket.IO client** | Receber mensagens do chat em tempo real | Espelho do servidor. Polling quebraria a experiência de conversa. |
| **Jest + Testing Library** | Testes de slice e unitários | Mesma família do backend; testa store e fluxo (login, favorito) sem Playwright. |
| **Playwright + axe-core** | E2E e checagens de acessibilidade | Jornada real no browser; Cypress seria alternativa, Playwright cobre a11y e vários browsers. |
| **ESLint + Prettier** | Padrão de código | Igual ao backend, reduz briga de formatação no PR. |

### 3.2.3 Ferramentas transversais

| Ferramenta | Papel | Por que esta |
|------------|-------|--------------|
| **Git / GitHub** | Versionamento e entrega da disciplina (link no AVA) | Repositórios separados por frente; histórico auditável. |
| **Jira** | Backlog, sprints, Stories/Subtasks | Quadro Scrum; a disciplina cita ClickUp — a equipe justificou Jira na seção 3.1.3. |
| **draw.io (diagrams.net)** | Diagrama de arquitetura (fonte `.drawio`) | Exigência da atividade; arquivo nativo + export SVG/PNG. |
| **Cursor / IDE** | Implementação | Editor com o kit de regras de camadas do backend; não substitui revisão humana do PO. |
| **Docker** | Dependências de infra local | Ver backend. |
| **Insomnia / curl / docs OpenAPI** | Exercitar a API | Conferir contrato sem a UI. |

---

## 3.3 Arquitetura da solução

A arquitetura responde **como as partes se organizam**. Há três visões que precisam coexistir:

1. **Visão de sistema** — dois processos (SPA + API) e dependências (MongoDB, S3, filas).
2. **Visão em camadas** — dentro de cada processo, quem pode chamar quem.
3. **Visão de módulos (backend)** — monólito modular: um processo, vários contextos de negócio.

Os diagramas versionados estão em [`diagramas/`](../../diagramas/) (`.drawio` + SVG + PNG):

**Figura 1 — Arquitetura da solução (containers)**

![Arquitetura da solução: navegador, frontend-web, gt-backend, MongoDB, S3 e SNS/SQS](../../diagramas/arquitetura-solucao.svg)

Fonte: elaborada pela equipe. Arquivo editável: `diagramas/arquitetura-gamertrust.drawio` (aba “Figura 1”). Exportações: `diagramas/arquitetura-solucao.svg` e `diagramas/arquitetura-solucao.png`.

**Figura 2 — Arquitetura em camadas e fluxo de uma requisição**

![Camadas FSD no web, fluxo HTTP e camadas do backend](../../diagramas/arquitetura-camadas.svg)

Fonte: elaborada pela equipe. Arquivo editável: `diagramas/arquitetura-gamertrust.drawio` (aba “Figura 2”). Exportações: `diagramas/arquitetura-camadas.svg` e `diagramas/arquitetura-camadas.png`.

### 3.3.1 Visão de sistema (backend e frontend-web)

```text
[Navegador]
    │  HTTPS (dev: http)
    ▼
[frontend-web]  React + Vite :5173
    │  REST (Axios) + Socket.IO (chat)
    ▼
[gt-backend]  Express + OpenAPI :3000
    │
    ├── MongoDB (documentos de domínio e read models)
    ├── S3 / LocalStack (mídia e evidências)
    └── SNS/SQS (eventos entre módulos; LocalStack no dev)
```

O web **não acessa o MongoDB**. Toda regra de publicação, selo e TrustScore passa pela API. Isso evita o anti-padrão de “a tela decide se está verificado”.

No desenvolvimento, CORS libera `http://localhost:5173`. Autenticação: access JWT no header `Authorization`; identidade **não** vem de `x-user-id` enviado pelo cliente.

### 3.3.2 Arquitetura em camadas — backend

O backend é um **monólito modular em camadas**. Camadas dizem *onde o código vive*; módulos dizem *o que um contexto pode saber do outro*.

| Camada | Pasta | Responsabilidade | Proibido |
|--------|-------|------------------|----------|
| **Application** | `src/application/` | Controllers Express: extrair `req`, chamar o Service, status HTTP, traduzir erro | Regra de negócio; acessar `*Model` |
| **Domain** | `src/domain/` | Entidades (`*ServiceEntity`), Services, contratos `I*Repository*` | Mongoose, Express, `process.env` espalhado |
| **Infraestructure** | `src/infraestructure/` | Mongo (`IM*`, schemas), adapters, S3, SQS, Socket.IO concreto | Decidir 404/409 de produto |
| **Configuration** | `src/configuration/` | Env, factories (DI) | Regra de negócio |
| **Contracts** | `src/contracts/service.yaml` | OpenAPI | Código TypeScript de regra |

**Entity vs Service:** a Entity valida o objeto (campo obrigatório, formato). O Service decide conflitos entre registros (“e-mail já existe”, “este ator pode editar este anúncio”, “não publica sem verificação”). Repository só persiste e devolve `null` se não houver documento.

Essa divisão não é dogma acadêmico: é o que permite **testar a regra sem subir HTTP** e **trocar S3/Mongo sem reescrever o marketplace**.

Módulos (contextos) no recorte atual incluem, entre outros: `identity`, `auth` (sessão), `catalog`, `listings`, `verification`, `trust`, `search`, `favorites`, `media`, `listing-chat`, `orders`, `ai` (análise assistida). Um módulo não importa o domínio do outro. Comunicação:

- **Síncrona:** portas cliente in-process (`ICatalogClient`, `ITrustClient`, …), com grafo acíclico.
- **Assíncrona:** eventos de domínio (`listings.listing.published`, `verification.case.approved`, …) via SNS/SQS.

Isso é **monólito modular**, não microsserviço. Microsserviços (um deploy por módulo) exigiriam rede, rastreio distribuído e operação que o tamanho da equipe não sustenta. A disciplina de portas/eventos deixa a extração futura como mudança de adapter, não reescrita de regra.

### 3.3.3 Arquitetura em camadas — frontend-web (FSD)

O web usa Feature-Sliced Design, com importação **somente para baixo**:

```text
01-app → 02-pages → 03-widgets → 04-features → 05-entities → 06-shared
```

| Camada FSD | Analogia no backend | Papel |
|------------|---------------------|-------|
| `01-app` | Configuration | Router, providers, bootstrap |
| `02-pages` / `03-widgets` | Application (controller) | Orquestração de tela; **sem** Axios e **sem** regra de marketplace |
| `04-features` | Domain Service | Caso de uso, Zustand, chamada `*-api.ts` |
| `05-entities` | Domain Entity / `I*` | Modelos (`IListing`, `ISeal`, …) e UI crua |
| `06-shared` | Infraestructure | `httpClient`, CSS tokens, botão genérico — **sem** vocabulário de anúncio/selo |

A simetria não é coincidência: reduz o custo de o mesmo time ler os dois repositórios. Uma tela de anúncio **mostra** selo `GRANTED` vindo da API; não calcula selo.

Troca mock → real: `04-features/*/api` resolve `mockApi` ou `httpClient` conforme `VITE_API_MODE`. A página não sabe a diferença.

### 3.3.4 Fluxo de uma requisição (ponta a ponta)

Exemplo: publicar evidência / obter anúncio autenticado — o padrão é o mesmo para a maior parte das rotas.

```text
1. Usuário na Page (02-pages) dispara ação (ex.: "enviar mensagem").
2. Feature (04-features) valida UI, atualiza Zustand se preciso, chama listing-chat-api.ts.
3. httpClient (06-shared) anexa Bearer e faz POST /conversations/{id}/messages.
4. Express: Helmet, CORS, rate-limit, OpenAPI validator, middleware JWT → ActorContext.
5. Controller (application) extrai params/body e chama ListingChatService.
6. Service (domain) prova participação na conversa, aplica regra (bloqueio, filtro de contato), persiste via I*Repository.
7. Repository (infra) adapta I* ↔ IM*, grava no Mongo; publisher Socket.IO notifica o outro participante.
8. Controller devolve JSON + status; Feature atualiza a thread; Widget re-renderiza.
```

Erros de produto saem como código (`EErrorCode`) traduzido — **sem** stack, sem mensagem crua de Mongo no corpo HTTP.

Fluxo assíncrono (exemplo: anúncio publicado → busca):

```text
Listings Service publica listings.listing.published
  → outbox / SNS
    → SQS do módulo search
      → handler reconcilia search_documents
        → GET /search passa a achar o anúncio
```

A busca não lê a collection `listings` diretamente. O read model pertence a `search` e pode ser reconstruído.

### 3.3.5 Princípios de produto que a arquitetura precisa sustentar

Estes princípios **não** são “detalhe de UI”; eles justificam camadas e contratos:

1. **Confiança > volume** — a API é quem concede selo e publica; a UI não pinta ícone de verificado por conta própria.
2. **Produto ≠ Oferta** — rotas web `/produto` (modelo de catálogo) e `/anuncio` (unidade usada) são distintas; no backend, `catalog` e `listings` são módulos distintos.
3. **IA não inventa** — análise assistida de evidência é apoio à moderação, não fonte de atributo ou preço “certo”.
4. **Ownership (BOLA/IDOR)** — o middleware prova *quem* é o caller; o Service prova *se esse caller pode tocar este registro*. Id na URL não é prova de dono.

---

## 3.4 Limitações assumidas e decisões com honestidade técnica

Metodologia de Nível A inclui o que **não** se fez e o porquê.

| Limitação / decisão | O que foi escolhido | O que se admite |
|---------------------|---------------------|-----------------|
| Tamanho da equipe | Scrum **adaptado** (papéis acumulados, daily leve) | Não há Scrum Guide “de livro” com três papéis full-time. Inventar cerimônias que não ocorreram seria desonesto. |
| Gestão de tarefas | **Jira**, não ClickUp | A ferramenta da disciplina era ClickUp; o time já operava Stories/Subtasks no Jira. O processo (Scrum) importa mais que o produto de board. |
| Deploy | Monólito modular (um processo Node) | Não há microsserviços. Extrair `payments` no futuro é intenção registrada, não fato desta entrega. |
| Banco | MongoDB documento | Relacional ajudaria relatórios financeiros rígidos; o MVP é catálogo + evidência de forma variável. Consistência entre módulos é por evento/saga, **não** por transação Mongo cruzando contextos. |
| Frontend | SPA Vite, sem SSR | SEO e first paint de catálogo público são piores que em Next.js; aceitável no recorte acadêmico. |
| Protótipo web | Mock primeiro, API depois | Risco de o mock “mentir” um campo. Mitigação: entidades `I*` compartilhadas e OpenAPI como juiz. |
| Pagamento / escrow | Pedido (buy now) em evolução; escrow completo é fase posterior | O produto-alvo promete pagamento protegido; **esta entrega não finge escrow que não está maduro**. |
| Mobile | Fora do recorte E4 | iOS/Android no monorepo de produto; paridade visual é requisito de produto, não desta atividade. |
| Tempo real | Socket.IO no chat | Não há sincronização offline robusta; conexão instável é restrição de persona, tratada de forma limitada. |
| IA | Assistência a evidência / prova | Não é moderação autônoma. Humano permanece no loop (Camila/André). |
| Observabilidade | Logs com traceability; sem APM completo no MVP | New Relic aparece desligado nos testes; produção plena exigiria mais. |
| Mensageria | SNS/SQS + LocalStack; outbox transacional em evolução | Fase 1 usou publish-after-commit em parte dos fluxos; caminho de dinheiro exigiria outbox mais rígido — e o time registra essa dívida em vez de escondê-la. |

A coerência pedida no Nível A é esta: **o processo (Scrum incremental) combina com o tamanho (equipe pequena) e com o tipo (produto exploratório de confiança)**. Um RUP/cascata de nove fases, ou um “SAFe” de portfólio, seria teatro. Um “só vamos codificando” sem Jira e sem contrato OpenAPI também não descreveria o que o repositório mostra: specs, factories, testes e dois apps desacoplados.

---

## 3.5 Síntese

O GamerTrust foi desenvolvido de forma **ágil e incremental**, gerido no **Jira com Scrum**, com **backend** responsável pelas regras e persistência e **frontend-web** responsável pela jornada. Os materiais (TypeScript nos dois lados, Express + Mongo no servidor, React + FSD no cliente) foram escolhidos para um time pequeno entregar fatias verticais sem fingir verificação. A arquitetura em camadas — e os diagramas em `diagramas/` — tornam esse recorte inspecionável: cada requisição entra pela UI, cruza o contrato HTTP e só então altera o domínio.

---

## Referências

FEATURE-SLICED DESIGN. *Feature-Sliced Design*. Disponível em: https://feature-sliced.design. Acesso em: 20 ago. 2026.

MONGOOSE. *Mongoose documentation*. Disponível em: https://mongoosejs.com. Acesso em: 20 ago. 2026.

REACT. *React documentation*. Disponível em: https://react.dev. Acesso em: 20 ago. 2026.

SCHWABER, Ken; SUTHERLAND, Jeff. *The Scrum Guide*. 2020. Disponível em: https://scrumguides.org. Acesso em: 20 ago. 2026.

SOMMERVILLE, Ian. *Engenharia de software*. 10. ed. São Paulo: Pearson, 2019. Capítulos sobre modelos de processo e arquitetura.

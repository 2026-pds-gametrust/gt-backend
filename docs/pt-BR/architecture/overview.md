# Visão da arquitetura

Resumo para humanos do backend GamerTrust. Decisões normativas no canon: [docs/architecture/00-overview.md](../../architecture/00-overview.md) (`ARCH-*`, `DEC-*`). Inglês: [en](../../en/architecture/overview.md).

## O que é este serviço

Um **monólito modular**: um processo Express, um MongoDB, módulos como bounded contexts (`identity`, `catalog`, `listings`, …). Extrair um módulo depois deve ser mudança de infraestrutura, não reescrita de domínio ([ARCH-001](../../architecture/01-modular-monolith.md)).

Fase 1 (Descoberta e confiança): identity, catalog, listings, verification, trust, search, favorites, media. Fases seguintes (orders, payments, …) estão no [mapa de módulos](./modules.md) mas não são HTTP neste MVP.

## Como ler a documentação

| Precisa | Leia |
|---------|------|
| Subir local | [Primeiros passos](../getting-started.md) |
| Chamar a API | [Convenções HTTP](./http-conventions.md) e [api/](../api/README.md) |
| Sync vs eventos | [Comunicação](./communication.md) |
| SNS/SQS, envelope, handlers | [Mensageria](./messaging.md) |
| Implementar feature | [Camadas](./layers.md) + [AGENTS.md](../../../AGENTS.md) + canon `ARCH-002`… |
| Citar decisão | [Registro DEC](../../architecture/00-overview.md#decision-registry) |

## Stack (como está no código)

- HTTP: Express + Helmet + `express-openapi-validator` contra `src/contracts/service.yaml`
- Persistência: MongoDB / Mongoose (replica set local para transações)
- AuthN: JWT de acesso first-party de curta duração + refresh opaco (sem Cognito)
- Mensageria: **SNS + SQS** (LocalStack no dev), mais **dispatch in-process** para `yarn dev` sem broker ainda rodar handlers de domínio. Contratos de domínio são neutros de transporte. Ver [comunicação](./communication.md) e [mensageria](./messaging.md).
- Mídia: S3 (ou memória com `S3_USE_MEMORY=true`)

## Grafia das pastas

Sempre **`infraestructure`** e **`configuration`**. Não renomear para “infrastructure” / “configurations”.

## Relacionados

- [Camadas](./layers.md)
- [Módulos](./modules.md)
- [Comunicação](./communication.md)
- [Mensageria](./messaging.md)
- [Segurança](./security.md)
- Kit: [docs/architecture-and-layers.md](../../architecture-and-layers.md)

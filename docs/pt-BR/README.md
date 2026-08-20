# Documentação do backend GamerTrust

API REST do marketplace GamerTrust (Fase 1 — Descoberta e confiança). O inglês é **normativo** para identificadores, paths HTTP e IDs `ARCH-*` / `DEC-*`. Espelho em inglês: [en](../en/README.md).

| Comece por aqui | |
|-----------------|--|
| [Primeiros passos](./getting-started.md) | Subir o serviço localmente |
| [Convenções HTTP](./architecture/http-conventions.md) | Auth, erros, paginação, Produto ≠ Oferta |
| [Módulos](./architecture/modules.md) | Bounded contexts, eventos, portas |
| [Comunicação](./architecture/communication.md) | Portas síncronas vs eventos de domínio |
| [Mensageria](./architecture/messaging.md) | Envelope, SNS/SQS, handlers |
| [API HTTP](./api/README.md) | Contratos gerados por endpoint |
| [Como documentar um endpoint](./contributing.md) | OpenAPI → `yarn docs:api` → DeepWiki |

## Docs de projeto

- [Visão da arquitetura](./architecture/overview.md)
- [Camadas](./architecture/layers.md)
- [Mapa de módulos](./architecture/modules.md)
- [Comunicação](./architecture/communication.md)
- [Convenções HTTP](./architecture/http-conventions.md)
- [Mensageria](./architecture/messaging.md)
- [Segurança](./architecture/security.md)
- [Glossário EN ↔ PT](./architecture/glossary.md)

## Módulos da Fase 1

| Módulo | Guia | API |
|--------|------|-----|
| Identidade e Auth | [modules/identity.md](./modules/identity.md) | [api/auth](./api/auth/) · [api/identity](./api/identity/) |
| Catálogo | [modules/catalog.md](./modules/catalog.md) | [api/catalog](./api/catalog/) |
| Listings | [modules/listings.md](./modules/listings.md) | [api/listings](./api/listings/) |
| Verificação | [modules/verification.md](./modules/verification.md) | [api/verification](./api/verification/) |
| Trust | [modules/trust.md](./modules/trust.md) | [api/trust](./api/trust/) |
| Busca | [modules/search.md](./modules/search.md) | [api/search](./api/search/) |
| Favoritos | [modules/favorites.md](./modules/favorites.md) | [api/favorites](./api/favorites/) |
| Mídia | [modules/media.md](./modules/media.md) | [api/media](./api/media/) |

## Outras fontes

| Tipo | Onde |
|------|------|
| Canon de arquitetura (`ARCH-*`, `DEC-*`) | [docs/architecture](../architecture/00-overview.md) |
| Catálogo de entidades | [docs/entities](../entities/INDEX.md) |
| Camadas do kit | [docs/architecture-and-layers.md](../architecture-and-layers.md) |
| Contrato de agents | [AGENTS.md](../../AGENTS.md) |
| Hub da documentação | [docs/README.md](../README.md) |
| DeepWiki | [`.devin/wiki.json`](../../.devin/wiki.json) |

## Regras de produto (não negociáveis)

1. **Confiança > volume** — nunca exibir selo ou “verificado” sem o processo concluído na API.
2. **Produto ≠ Oferta** — `/products` é o modelo de catálogo; `/listings` é a unidade à venda.
3. **IA não inventa** — atributos, condição, garantia e selos vêm da API, não do cliente preenchendo lacunas.
4. **Cadastro público** é `POST /auth/register`, não `POST /users` (somente admin).

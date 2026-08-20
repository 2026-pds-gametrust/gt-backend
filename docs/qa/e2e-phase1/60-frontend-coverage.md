---
feature: e2e-phase1-write-endpoints
status: IN_PROGRESS
version: 1.0.0
owner: QA
phase: "Cobertura backend -> frontend"
---

# Cobertura do backend no frontend

Cruzamento mecanico entre as 68 operacoes de `src/contracts/service.yaml` e as chamadas
`httpClient.*` do `frontend-web`.

## Resultado que corrige a premissa

**O frontend ja chamava 66 das 68 operacoes.** A camada de cliente estava praticamente
completa — a lacuna real nunca foi "endpoint sem cliente", e sim **capacidade sem tela**.

Faltavam **2** clientes, agora adicionados:

| Operacao | Onde ficou |
|---|---|
| `GET /cep/{cep}` | `identityApi.lookupCep` — ligado ao perfil para preencher "local aproximado" |
| `GET /profiles/near` | `identityApi.listProfilesNear` — cliente pronto, **sem tela ainda** |

Tipos novos em `05-entities/profile/model`: `ICepLookupResult`, `IProfileNear`, `IGeoPoint`.

## Lacuna de tela preenchida: `/meus-anuncios`

Era o maior buraco de usuario: o vendedor criava um anuncio pelo wizard e **nao tinha
nenhuma tela para ve-lo, editar ou pausar**. Nenhuma rota listava as ofertas do proprio
ator.

`src/02-pages/my-listings/my-listings-page.tsx` (rota protegida `/meus-anuncios`, item
"Meus anuncios" na navegacao):

- lista as ofertas do ator com status traduzido e preco
- **alterar preco** enquanto `DRAFT`/`SUBMITTED` (o backend responde 409 depois disso)
- **enviar para revisao** quando `DRAFT`
- **pausar** quando `PUBLISHED`
- estado vazio apontando para o wizard

> `GET /listings` nao aceita filtro por vendedor, e query param nao declarado vira 400
> (F7) — entao o recorte por `sellerId` acontece no cliente. Para catalogo grande isso
> nao escala; o backend precisaria de `?sellerId=` paginado.

Coberto por `e2e/my-listings.spec.ts`: navegacao, listagem e redirecionamento de anonimo.

## Telas que ja existiam (nao eram lacuna)

`/moderacao` esta completa — aprovar, rejeitar, atribuir, listar evidencias, publicar,
pausar e recompute de trust score. Minha ressalva anterior era sobre **nao ter testado**,
nao sobre faltar implementacao.

## Telas de administracao criadas

Antes disso, catalogo e usuarios so podiam ser operados por `curl`.

### `/admin/catalogo` (backoffice + admin)

`src/02-pages/admin/catalog-admin-page.tsx` — abas Categorias / Servicos / Produtos:

- criar e editar categoria e servico (nome + sinonimos)
- criar produto sob uma categoria, e editar marca/modelo
- `id` e `slug` derivados do nome com sufixo temporal, porque ambos sao unicos e o
  backend responde 409

### `/admin/usuarios` (backoffice + admin; grupos so admin)

`src/02-pages/admin/users-admin-page.tsx`:

- lista usuarios com grupos e status de verificacao
- **alterar grupos** apenas quando a sessao e `admin` (`PUT /users/{id}/groups` e ADMIN-only);
  para backoffice o controle nem aparece, e a tela diz por que
- **verificar usuario** quando ainda nao verificado

Ambas atras de `RequireAuth requireOperator`, que devolve "Sem permissao" em vez de
deslogar — 403, nao 401.

### Evidencia no backend apos os testes

```
categoria criada pela UI : e2e-cat-1787159183938...  status=ACTIVE
produto criado pela UI   : NVIDIA RTX 1787159184615  categoryId=seed-cat-consoles
sinonimos projetados     : 2                          <- via evento SQS
```

A projecao de sinonimos confirma que a acao na UI atravessou
`catalog.category.created` -> SNS -> SQS -> `TaxonomySynonymEventHandler`.

Coberto por `e2e/admin.spec.ts` (5 casos), incluindo o 403 para member sem backoffice
e a ausencia do controle de grupos para quem nao e admin.

## O que continua sem tela

Capacidade existe no backend e ha cliente no frontend, mas nenhuma interface usa:

| Area | Operacoes | Observacao |
|---|---|---|
| Attribute schema | `PUT /categories/{id}/attribute-schema` | a tela de catalogo ainda nao edita o schema de atributos |
| Excluir usuario | `DELETE /users/{id}` | deliberadamente fora: destrutivo, sem confirmacao desenhada |
| Selos | `POST /seals/{id}/revoke`, `GET /seals` | revogacao so via API |
| Evidencias (vendedor) | `POST /verification-cases`, `.../evidence` | o vendedor nao anexa evidencia pela UI |
| Historico de preco | `GET /products/{id}/price-history` | cliente existe, sem tela |
| Sinonimos | `GET /synonyms` | cliente existe, sem tela |
| Eventos do anuncio | `GET /listings/{id}/events` | cliente existe, sem tela |
| Vendedores por perto | `GET /profiles/near` | cliente novo, sem tela |

Sao telas de administracao e de detalhe — trabalho de produto, nao correcao de defeito.
Nenhuma delas quebra um fluxo existente como o F15 quebrava.

## Verificacao

Playwright **17/17**, 64 testes unitarios verdes, typecheck limpo, lint com apenas o
aviso pre-existente de `useEffect` em `sell-page.tsx`.

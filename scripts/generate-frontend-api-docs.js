#!/usr/bin/env node
/**
 * Generates bilingual HTTP API docs from src/contracts/service.yaml
 * into docs/en/api/ and docs/pt-BR/api/.
 *
 * Coverage: 100% of OpenAPI paths (mirrors controllers).
 *
 * Usage: yarn docs:api
 *    or: node scripts/generate-frontend-api-docs.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.join(__dirname, '..');
const SPEC = path.join(ROOT, 'src/contracts/service.yaml');
const BASE_URL = process.env.FRONTEND_API_BASE_URL || 'http://localhost:3000';
const SPEC_DOC_LINK = '../../../src/contracts/service.yaml';

const LOCALES = ['en', 'pt-BR'];
const OUT_BY_LOCALE = {
  en: path.join(ROOT, 'docs/en/api'),
  'pt-BR': path.join(ROOT, 'docs/pt-BR/api'),
};

const TAG_TO_DOMAIN = {
  Auth: 'auth',
  Users: 'identity',
  Profiles: 'identity',
  CEP: 'identity',
  Catalog: 'catalog',
  Listings: 'listings',
  Verification: 'verification',
  Trust: 'trust',
  Search: 'search',
  Favorites: 'favorites',
  Media: 'media',
};

const DOMAIN_TO_MODULE_DOC = {
  auth: 'identity',
  identity: 'identity',
  catalog: 'catalog',
  listings: 'listings',
  verification: 'verification',
  trust: 'trust',
  search: 'search',
  favorites: 'favorites',
  media: 'media',
};

function L(en, pt) {
  return { en, 'pt-BR': pt };
}

function pick(localized, locale) {
  if (localized == null) return '';
  if (typeof localized === 'string') return localized;
  return localized[locale] || localized.en || '';
}

const PRODUCT_GAIN = {
  catalog: {
    domain: L(
      'Catalog is the discovery base: product ≠ offer. Consistent taxonomy enables search, filters, and trustworthy attributes on the client.',
      'Catálogo é a base de descoberta: produto ≠ oferta. Taxonomia consistente habilita busca, filtros e atributos confiáveis no front.',
    ),
    byPath: {
      '/categories': L(
        'Organizes inventory by type — navigation, chips, and filters.',
        'Organiza inventário por tipo — navegação, chips e filtros.',
      ),
      '/categories/{id}': L(
        'Canonical category detail for browse and forms.',
        'Detalhe canônico da categoria para browse e formulários.',
      ),
      '/categories/{categoryId}/attribute-schema': L(
        'Dynamic listing-form attributes per category — the client must not invent fields.',
        'Atributos dinâmicos do formulário de anúncio por categoria — o front não inventa campos.',
      ),
      '/services': L(
        'Marketplace service taxonomy — consistent labels and filters.',
        'Taxonomia de serviços do marketplace — labels e filtros consistentes.',
      ),
      '/services/{id}': L(
        'Service detail for selection and UI validation.',
        'Detalhe do serviço para seleção e validação na UI.',
      ),
      '/products': L(
        'Product model (catalog), not the unit offer — search and comparison base.',
        'Modelo de produto (catálogo), não a oferta unitária — base de busca e comparação.',
      ),
      '/products/{id}': L(
        'Model sheet for product PDP and deep-links.',
        'Ficha do modelo para PDP de produto e deep-links.',
      ),
      '/products/{productId}/price-history': L(
        'Model-level price history — transparency for the buyer.',
        'Histórico de preço do modelo — transparência para o comprador.',
      ),
    },
  },
  listings: {
    domain: L(
      'Listings are unit offers (offer ≠ product). Draft → submit → verify → publish keeps trust above volume.',
      'Listings são ofertas unitárias (oferta ≠ produto). Fluxo draft → submit → verify → publish sustenta confiança > volume.',
    ),
    byPath: {
      '/listings': L(
        'Offer list/feed — main discovery surface.',
        'Lista/feed de ofertas — superfície principal de descoberta.',
      ),
      '/listings/{id}': L(
        'Listing page: price, condition, seals, and seller trust.',
        'Página do anúncio: preço, condição, selos e confiança do vendedor.',
      ),
      '/listings/{id}/submit': L(
        'Sends for verification — never fake a seal before the process.',
        'Envia para verificação — sem fingir selo antes do processo.',
      ),
      '/listings/{id}/publish': L(
        'Publishes after verification — only then it enters search.',
        'Publica após verificação — só então entra na busca.',
      ),
      '/listings/{id}/pause': L(
        'Pauses the offer without deleting history — seller control.',
        'Pausa oferta sem apagar histórico — controle do vendedor.',
      ),
      '/listings/{id}/events': L(
        'Status timeline — transparency of the listing journey.',
        'Timeline de estados — transparência da jornada do anúncio.',
      ),
      '/listings/mine': L(
        'Seller workspace — own listings with verificationSummary and requiredChanges for corrections.',
        'Workspace do vendedor — anúncios próprios com verificationSummary e requiredChanges para correções.',
      ),
    },
  },
  verification: {
    domain: L(
      'Verification and seals are the trust differentiator. Never show a seal without a completed case.',
      'Verificação e selos são o diferencial de confiança. Nunca exibir selo sem caso concluído.',
    ),
    byPath: {
      '/verification-cases': L(
        'Moderation queue with filters, search and AI score — backoffice review.',
        'Fila de moderação com filtros, busca e score IA — revisão backoffice.',
      ),
      '/verification-cases/{id}': L(
        'Case detail and evidence.',
        'Detalhe do caso e evidências.',
      ),
      '/verification-cases/{id}/assign': L(
        'Assigns a reviewer (ops).',
        'Atribui revisor (operação).',
      ),
      '/verification-cases/{id}/approve': L(
        'Approves → enables publish and seal grant.',
        'Aprova → habilita publish e concessão de selo.',
      ),
      '/verification-cases/{id}/reject': L(
        'Definitive reject — listing becomes REJECTED (terminal); seller cannot resubmit.',
        'Rejeição definitiva — listing vai a REJECTED (terminal); vendedor não reenvia.',
      ),
      '/verification-cases/{id}/request-changes': L(
        'Request granular corrections (photo/video/description) — listing returns to DRAFT for seller edit.',
        'Pedir correções granulares (foto/vídeo/descrição) — listing volta a DRAFT para edição do vendedor.',
      ),
      '/verification-cases/{caseId}/evidence': L(
        'Evidence that supports the seal — auditability.',
        'Evidências que sustentam o selo — auditabilidade.',
      ),
      '/seals': L(
        'Verification badges on the offer.',
        'Badges de verificação na oferta.',
      ),
      '/seals/{id}': L(
        'Seal detail/explanation in the UI.',
        'Detalhe/explicação do selo na UI.',
      ),
      '/seals/{id}/revoke': L(
        'Revokes a seal — drop the false trust signal immediately.',
        'Revoga selo — remove sinal falso de confiança imediatamente.',
      ),
    },
  },
  trust: {
    domain: L(
      'TrustScore and seller level explain why to trust — with reasons, not color alone.',
      'TrustScore e nível do vendedor explicam “por que confiar” — com motivos, não só cor.',
    ),
    byPath: {
      '/trust-events': L(
        'Ledger of events that feed the score (explainability).',
        'Ledger de eventos que alimentam o score (explicabilidade).',
      ),
      '/trust-scores/{sellerId}': L(
        'Seller score on the listing page and profile.',
        'Score do vendedor na página do anúncio e perfil.',
      ),
      '/trust-scores/{sellerId}/recompute': L(
        'Operational score recompute after events.',
        'Recálculo operacional do score após eventos.',
      ),
      '/seller-levels/{sellerId}': L(
        'Progression level/badge — incentive and social signal.',
        'Nível/badge de progressão — incentivo e sinal social.',
      ),
    },
  },
  search: {
    domain: L(
      'Search is the home entry point. Synonyms and reconcile keep relevance.',
      'Busca é a porta de entrada (home dominante). Sinônimos e reconcile mantêm relevância.',
    ),
    byPath: {
      '/search': L(
        'Main offer search with query and filters.',
        'Busca principal de ofertas com query e filtros.',
      ),
      '/search/reconcile': L(
        'Rebuild the search read model — operational consistency.',
        'Reindexação do read model — consistência operacional.',
      ),
      '/synonyms': L(
        'Term expansion (e.g. PS5 ↔ PlayStation 5) — fewer zero-results.',
        'Expansão de termos (ex.: PS5 ↔ PlayStation 5) — menos zero-result.',
      ),
    },
  },
  favorites: {
    domain: L(
      'Favorites support re-engagement and, later, alerts — without fake conversion pressure.',
      'Favoritos sustentam reengajamento e, no futuro, alertas — sem pressão de conversão falsa.',
    ),
    byPath: {
      '/favorites': L(
        'User saved list — “want later”.',
        'Lista salva do usuário — “quero depois”.',
      ),
      '/favorites/{id}': L(
        'Remove a favorite.',
        'Remove favorito.',
      ),
    },
  },
  identity: {
    domain: L(
      'Identity and profile anchor ownership, account verification, and addresses — a trust prerequisite. Marketplace User does not store a password; session comes from /auth/*.',
      'Identidade e perfil ancoram ownership, verificação de conta e endereços — pré-requisito de confiança. Conta de marketplace (User) não guarda senha; sessão vem de /auth/*.',
    ),
    byPath: {
      '/users': L(
        'ADMIN creates a User without credentials (not public signup). List is BACKOFFICE/ADMIN.',
        'ADMIN cria User sem credencial (não é cadastro público). Lista BACKOFFICE/ADMIN.',
      ),
      '/users/{id}': L(
        'PII: GET/PUT/DELETE owner or ADMIN only. Owner PUT does not write verified/status.',
        'PII: GET/PUT/DELETE só dono ou ADMIN. PUT do dono não grava verified/status.',
      ),
      '/users/{id}/verify': L(
        'ADMIN/BACKOFFICE marks identity verified — never fake a listing seal from this flag alone.',
        'ADMIN/BACKOFFICE marca identidade verificada — nunca fingir selo na UI só com esse flag.',
      ),
      '/users/{id}/groups': L(
        'ADMIN assigns roles (app-user, backoffice, admin). No self-escalation or SYSTEM.',
        'ADMIN atribui papéis (app-user, backoffice, admin). Sem auto-escalada nem SYSTEM.',
      ),
      '/profiles': L(
        'Profile and addresses — seller presentation / delivery.',
        'Perfil e endereços — apresentação do vendedor/entrega.',
      ),
      '/profiles/by-user/{userId}': L(
        'Profile lookup by userId — seller page and future checkout.',
        'Lookup de perfil por userId — seller page e checkout futuro.',
      ),
      '/profiles/{id}': L(
        'Profile detail/update (mutation requires Bearer + ownership).',
        'Detalhe/update de perfil (mutação exige Bearer + ownership).',
      ),
      '/profiles/near': L(
        'Geo listing of nearby profiles — discovery, not a trust seal.',
        'Listagem geo de perfis próximos — discovery, não é selo de confiança.',
      ),
      '/cep/{cep}': L(
        'Brazilian postal-code lookup (BrasilAPI) for address forms (Bearer).',
        'Consulta de CEP (BrasilAPI) para formulários de endereço (Bearer).',
      ),
    },
  },
  auth: {
    domain: L(
      'First-party session: short-lived access JWT + opaque refresh. No Cognito. x-user-* headers do not authenticate.',
      'Sessão first-party: access JWT curto + refresh opaco. Sem Cognito. Headers x-user-* não autenticam.',
    ),
    byPath: {
      '/auth/register': L(
        'Public signup: creates User + credential, app-user group, returns tokens. Duplicate email/CPF → uniform 400 (not 409).',
        'Cadastro público: cria User + credencial, group app-user, devolve tokens. Duplicata de email/CPF → 400 uniforme (não 409).',
      ),
      '/auth/login': L(
        'Email+password login. Failure is always 401 AUTH_INVALID_CREDENTIALS (no email enumeration). BLOCKED cannot sign in.',
        'Login email+senha. Falha sempre 401 AUTH_INVALID_CREDENTIALS (não enumerar email). BLOCKED não entra.',
      ),
      '/auth/refresh': L(
        'Rotates refresh. Reuse of a revoked token kills the session family.',
        'Rotaciona refresh. Reuso de token revogado derruba a família da sessão.',
      ),
      '/auth/logout': L(
        'Ends this session: revokes refresh and invalidates the access JWT immediately.',
        'Encerra esta sessão: revoga refresh e invalida o access JWT na hora.',
      ),
      '/auth/me': L(
        'Hydrates the app session: public User from the token (no password).',
        'Hidrata a sessão no app: User público do token (sem senha).',
      ),
    },
  },
  media: {
    domain: L(
      'Image upload (product, listing, evidence). Ownership in the Service; this HTTP slice may not require Bearer in the contract.',
      'Upload de imagens (produto, anúncio, evidência). Ownership no service; rotas HTTP desta fatia não exigem Bearer no contrato.',
    ),
    byPath: {
      '/media/uploads': L(
        'Upload grant (temporary URL) — do not invent media on the client.',
        'Grant de upload (URL temporária) — não inventar mídia no front.',
      ),
      '/media/uploads/{id}/complete': L(
        'Confirms upload for processing.',
        'Confirma upload para processamento.',
      ),
      '/media/assets/{id}': L(
        'Asset metadata (status READY before display).',
        'Metadados do asset (status READY antes de exibir).',
      ),
      '/media/assets/{id}/content': L(
        'Content read grant.',
        'Grant de leitura do conteúdo.',
      ),
    },
  },
};

const AUTH_MATRIX = {
  public: L(
    'Public — no Authorization. Discovery and auth register/login/refresh (not CEP).',
    'Público — sem Authorization. Discovery e auth register/login/refresh (CEP exige Bearer).',
  ),
  bearer: L(
    'Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+).',
    'Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+).',
  ),
  backoffice: L(
    'Bearer + group `backoffice` or `admin` (`authorizeByGroup`).',
    'Bearer + group `backoffice` ou `admin` (`authorizeByGroup`).',
  ),
  admin: L(
    'Bearer + group `admin` only.',
    'Bearer + group `admin` apenas.',
  ),
  ownerOrAdmin: L(
    'Bearer + resource owner **or** `admin` (BACKOFFICE is not enough for User PII).',
    'Bearer + dono do recurso **ou** `admin` (BACKOFFICE não basta em PII de User).',
  ),
};

const UI = {
  domain: L('Domain', 'Domínio'),
  openApiTag: L('OpenAPI tag', 'Tag OpenAPI'),
  method: L('Method', 'Método'),
  path: L('Path', 'Path'),
  successStatus: L('Success status', 'Status sucesso'),
  authorization: L('Authorization', 'Autorização'),
  whatItDoes: L('What this endpoint does', 'O que este endpoint faz'),
  productGain: L('Product value', 'Ganho no produto'),
  howRelated: L('How it relates', 'Como se relaciona'),
  moduleGuide: L('Module guide', 'Guia do módulo'),
  httpConventions: L('HTTP conventions', 'Convenções HTTP'),
  contractFiles: L('Files in this contract', 'Arquivos deste contrato'),
  noRequestBody: L(
    '_This endpoint does not require a request body._',
    '_Este endpoint não exige request body._',
  ),
  seeParameters: L(
    'See parameters in [parameters.md](./parameters.md).',
    'Veja parâmetros em [parameters.md](./parameters.md).',
  ),
  noFormalContract: L(
    '_No formal contract in OpenAPI._',
    '_Sem contrato formal no OpenAPI._',
  ),
  schemaNotFound: (name) =>
    L(`_Schema ${name} not found._\n`, `_Schema ${name} não encontrado._\n`),
  openApiSchema: L('OpenAPI schema', 'Schema OpenAPI'),
  field: L('Field', 'Campo'),
  type: L('Type', 'Tipo'),
  required: L('Required', 'Obrigatório'),
  description: L('Description', 'Descrição'),
  yes: L('yes', 'sim'),
  no: L('no', 'não'),
  example: L('Example', 'Exemplo'),
  arrayOf: L('Type', 'Tipo'),
  documentedErrors: L('Documented errors', 'Erros documentados'),
  noBody204: L('_No body (204 No Content)._', '_Sem body (204 No Content)._'),
  noResponseSchema: L(
    '_No documented response schema (empty or untyped body)._',
    '_Sem schema de resposta documentado (body vazio ou não tipado)._',
  ),
  noPathQuery: L('_No path/query parameters._', '_Sem path/query parameters._'),
  nameCol: L('Name', 'Nome'),
  inCol: L('In', 'In'),
  recommendedHeaders: L('Recommended headers', 'Headers recomendados'),
  header: L('Header', 'Header'),
  when: L('When', 'Quando'),
  always: L('always', 'sempre'),
  withBody: L('with body', 'com body'),
  requiredOnEndpoint: L(
    'required on this endpoint',
    'obrigatório neste endpoint',
  ),
  doNotSendActorHeaders: L(
    '**Do not send** `x-user-id` / `x-user-groups` as identity: the backend ignores them and trusts the JWT only.',
    '**Não enviar** `x-user-id` / `x-user-groups` como identidade: o backend ignora e só confia no JWT.',
  ),
  whenToCall: L('When to call from the client', 'Quando chamar no frontend'),
  typicalSequence: L('Typical sequence', 'Sequência típica'),
  stepBuildUrl: L(
    'Build URL with path/query from [parameters.md](./parameters.md).',
    'Montar URL com path/query de [parameters.md](./parameters.md).',
  ),
  stepValidateBody: L(
    'Validate the payload against [request.md](./request.md) before submit.',
    'Validar o payload contra [request.md](./request.md) antes do submit.',
  ),
  stepNoBody: L(
    'Do not send a body (headers/params only).',
    'Não enviar body (apenas headers/params).',
  ),
  stepSuccess: L(
    'Handle success with [response.md](./response.md).',
    'Tratar sucesso com [response.md](./response.md).',
  ),
  stepErrors: L(
    'Map errors to toast/empty-state — **do not invent a trust state** on failure.',
    'Mapear erros para toast/empty-state — **não inventar estado de confiança** em falha.',
  ),
  fetchTs: L('Fetch (TypeScript)', 'Fetch (TypeScript)'),
  noJson204: L('// 204: no JSON', '// 204: sem JSON'),
  seeCurl: L('See [curl.sh](./curl.sh).', 'Ver [curl.sh](./curl.sh).'),
  domainTitle: L('Domain', 'Domínio'),
  endpoints: L('Endpoints', 'Endpoints'),
  summary: L('Summary', 'Resumo'),
  contract: L('Contract', 'Contrato'),
  open: L('open', 'abrir'),
  resources: L('Resources', 'Recursos'),
  resource: L('Resource', 'Recurso'),
  schemasTitle: L('OpenAPI schemas', 'Schemas OpenAPI'),
  schemasMirror: L(
    'Mirror of `components/schemas`.',
    'Espelho de `components/schemas`.',
  ),
  total: L('Total', 'Total'),
  indexTitle: L(
    'HTTP API — contracts by domain',
    'API HTTP — contratos por domínio',
  ),
  indexIntro: L(
    'Generated from `src/contracts/service.yaml` for API consumers.',
    'Gerada a partir de `src/contracts/service.yaml` para consumidores da API.',
  ),
  source: L('Source', 'Fonte'),
  localBaseUrl: L('Local base URL', 'Base URL local'),
  documentedEndpoints: L('Documented endpoints', 'Endpoints documentados'),
  generatedOn: L('Generated on', 'Gerado em'),
  startHere: L('Start here', 'Comece por aqui'),
  domains: L('Domains', 'Domínios'),
  folder: L('Folder', 'Pasta'),
  fullIndex: L('Full endpoint index', 'Índice completo de endpoints'),
  structure: L('Per-endpoint structure', 'Estrutura por endpoint'),
  productRules: L(
    'Product rules (non-negotiable on the client)',
    'Regras de produto (não negociáveis no front)',
  ),
  howToRegen: L('How to regenerate', 'Como regenerar'),
  otherLocale: L('Português (Brasil)', 'English'),
  otherLocaleHref: L('../../pt-BR/api/', '../../en/api/'),
  projectDocs: L('Project docs', 'Docs de projeto'),
  schemaLabel: L('Schema', 'Schema'),
};

const RELATED = {
  auth: [
    L('`POST /auth/register` → initial session', '`POST /auth/register` → sessão inicial'),
    L('`POST /auth/login` → existing session', '`POST /auth/login` → sessão existente'),
    L('`POST /auth/refresh` → renew access', '`POST /auth/refresh` → renovar access'),
    L('`POST /auth/logout` → end session', '`POST /auth/logout` → encerrar sessão'),
    L('`GET /auth/me` → hydrate User', '`GET /auth/me` → hidratar User'),
    L('`POST /profiles` → profile after account', '`POST /profiles` → perfil após conta'),
    L('`POST /listings` → sell (Bearer)', '`POST /listings` → vender (Bearer)'),
  ],
  users: [
    L('`POST /auth/register` — public signup (do not use POST /users)', '`POST /auth/register` — cadastro público (não use POST /users)'),
    L('`GET /auth/me` — session User', '`GET /auth/me` — User da sessão'),
    L('`PUT /users/{id}/groups` — roles (ADMIN)', '`PUT /users/{id}/groups` — papéis (ADMIN)'),
  ],
  listings: [
    L('`GET /products/{id}` — model (product ≠ offer)', '`GET /products/{id}` — modelo (produto ≠ oferta)'),
    L('`POST /listings` → `POST .../submit` → verification → `POST .../publish`', '`POST /listings` → `POST .../submit` → verificação → `POST .../publish`'),
    L('`GET /seals?listingId=` — seal only if GRANTED', '`GET /seals?listingId=` — selo só se GRANTED'),
    L('`GET /trust-scores/{sellerId}` — reasons, not color alone', '`GET /trust-scores/{sellerId}` — motivos, não só cor'),
  ],
  verification: [
    L('`POST /listings/{id}/submit` opens the case', '`POST /listings/{id}/submit` abre o caso'),
    L('`POST .../approve` enables publish', '`POST .../approve` habilita publish'),
    L('UI: never show a seal without `GRANTED`', 'UI: nunca mostrar selo sem `GRANTED`'),
  ],
  search: [
    L('`GET /listings/{id}` — offer detail', '`GET /listings/{id}` — detalhe da oferta'),
    L('`GET /categories` — filters', '`GET /categories` — filtros'),
    L('Only PUBLISHED listings enter the index', 'Só listings PUBLISHED entram no índice'),
  ],
  favorites: [
    L('Bearer: userId comes from the token, not the body', 'Bearer: userId vem do token, não do body'),
    L('`GET /listings/{id}` — favorite destination', '`GET /listings/{id}` — destino do favorito'),
  ],
  media: [
    L('Use the asset `id` on `Listing.media` / evidence', 'Usar `id` do asset em `Listing.media` / evidência'),
    L('Display only when status is `READY`', 'Só exibir quando status `READY`'),
  ],
  profiles: [
    L('`POST /auth/register` — account before profile', '`POST /auth/register` — conta antes do perfil'),
    L('`GET /profiles/by-user/{userId}` — seller page', '`GET /profiles/by-user/{userId}` — seller page'),
    L('`POST /listings` — selling requires account/profile', '`POST /listings` — vender exige perfil/conta'),
  ],
  catalog: [
    L('`GET /categories/{categoryId}/attribute-schema` — listing form', '`GET /categories/{categoryId}/attribute-schema` — formulário de anúncio'),
    L('`POST /listings` uses `productId` (offer ≠ product)', '`POST /listings` usa `productId` (oferta ≠ produto)'),
    L('`GET /search` — public discovery', '`GET /search` — discovery pública'),
  ],
  trust: [
    L('`GET /listings/{id}` — PDP shows score for `sellerId`', '`GET /listings/{id}` — PDP mostra score do `sellerId`'),
    L('`GET /seals` — listing seal, not the score', '`GET /seals` — selo da oferta, não do score'),
    L('Never reduce TrustScore to a color without API reasons', 'Nunca reduzir TrustScore a cor sem motivo da API'),
  ],
  cep: [
    L('Use on address forms after `POST /auth/register` (Bearer)', 'Usar em formulários de endereço após `POST /auth/register` (Bearer)'),
    L('`POST /profiles` stores the resolved address', '`POST /profiles` guarda o endereço resolvido'),
  ],
};

const FRONT_ERROR = {
  '401': L(
    'Clear the session if access expired; try `POST /auth/refresh`; if that fails, go to login. **Do not** spoof `x-user-id`.',
    'Limpar sessão se o access expirou; tentar `POST /auth/refresh`; se falhar, ir para login. **Não** spoofar `x-user-id`.',
  ),
  '403': L(
    'Authenticated user without permission — access-denied message, do not pretend the action succeeded.',
    'Usuário autenticado sem permissão — mensagem de acesso negado, sem fingir que a ação ocorreu.',
  ),
  '404': L(
    'Empty-state / page 404. Do not invent the resource.',
    'Empty-state / 404 de página. Não inventar recurso.',
  ),
  '409': L(
    'Conflict (e.g. illegal state). Show the catalog `code`.',
    'Conflito (ex.: transição ilegal). Mostrar o `code` do catálogo.',
  ),
  '429': L(
    'Throttle: wait and retry with backoff. Do not enumerate identity.',
    'Throttle: esperar e retry com backoff. Não enumerar identidade.',
  ),
  '400': L(
    'Validation / `USER_UNDERAGE` / `FIELD_INVALID` (duplicate register is also 400). Highlight fields; **do not** treat register 400 as “email already exists” in copy.',
    'Validação / `USER_UNDERAGE` / `FIELD_INVALID` (register duplicado também é 400). Destacar campos; **não** tratar 400 de register como “email já existe” na copy.',
  ),
  default: L(
    'Generic error; do not leak internals.',
    'Erro genérico; não vazar detalhes internos.',
  ),
};

function ui(key, locale) {
  const val = UI[key];
  if (typeof val === 'function') return pick(val, locale);
  return pick(val, locale);
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function opFolderName(method, pathStr) {
  const cleaned = pathStr
    .replace(/^\//, '')
    .replace(/\{([^}]+)\}/g, 'by-$1')
    .replace(/\//g, '-');
  return `${method.toLowerCase()}-${cleaned || 'root'}`;
}

function resourceFromPath(p) {
  const parts = p.replace(/^\//, '').split('/');
  return parts.find((x) => !x.startsWith('{')) || 'root';
}

function domainFromTag(tag) {
  return TAG_TO_DOMAIN[tag] || slugify(tag || 'misc');
}

function productGain(domain, pathStr, locale) {
  const d = PRODUCT_GAIN[domain];
  if (!d) {
    return pick(
      L(
        'Supports the GamerTrust experience for this domain.',
        'Suporta a experiência GamerTrust alinhada ao domínio.',
      ),
      locale,
    );
  }
  return pick(d.byPath[pathStr] || d.domain, locale);
}

function resolveRef(schemas, ref) {
  if (!ref || typeof ref !== 'string') return null;
  const name = ref.replace('#/components/schemas/', '');
  return { name, schema: schemas[name] };
}

function exampleFromProp(schemas, prop, depth = 0) {
  if (!prop || depth > 8) return null;
  if (prop.$ref) {
    const r = resolveRef(schemas, prop.$ref);
    return schemaToJson(schemas, r?.schema, depth + 1);
  }
  if (prop.example !== undefined) return prop.example;
  if (prop.enum) return prop.enum[0];
  if (prop.default !== undefined) return prop.default;
  switch (prop.type) {
    case 'string':
      if (prop.format === 'date-time') return '2026-08-07T12:00:00.000Z';
      if (prop.format === 'uuid') return '550e8400-e29b-41d4-a716-446655440000';
      if (prop.format === 'email') return 'user@example.com';
      return 'string';
    case 'integer':
    case 'number':
      return prop.minimum ?? 0;
    case 'boolean':
      return false;
    case 'array':
      return [exampleFromProp(schemas, prop.items, depth + 1)];
    case 'object':
      return schemaToJson(schemas, prop, depth + 1);
    default:
      if (prop.properties) return schemaToJson(schemas, prop, depth + 1);
      if (prop.allOf) {
        return Object.assign(
          {},
          ...prop.allOf.map((s) => schemaToJson(schemas, s, depth + 1) || {}),
        );
      }
      return null;
  }
}

function schemaToJson(schemas, schema, depth = 0) {
  if (!schema) return null;
  if (depth > 8) return '...';
  if (schema.$ref) {
    const r = resolveRef(schemas, schema.$ref);
    return schemaToJson(schemas, r?.schema, depth + 1);
  }
  if (schema.allOf) {
    return Object.assign(
      {},
      ...schema.allOf.map((s) => schemaToJson(schemas, s, depth + 1) || {}),
    );
  }
  if (schema.oneOf || schema.anyOf) {
    return {
      _oneOf: (schema.oneOf || schema.anyOf).map((s) =>
        schemaToJson(schemas, s, depth + 1),
      ),
    };
  }
  if (schema.type === 'array') {
    return [schemaToJson(schemas, schema.items, depth + 1)];
  }
  if (schema.type === 'object' || schema.properties) {
    const out = {};
    for (const [k, v] of Object.entries(schema.properties || {})) {
      out[k] = exampleFromProp(schemas, v, depth + 1);
    }
    return out;
  }
  return exampleFromProp(schemas, schema, depth);
}

function schemaDetail(schemas, name, schema, locale) {
  if (!schema) return pick(UI.schemaNotFound(name), locale);
  let md = `**${ui('openApiSchema', locale)}:** \`${name}\`\n\n`;
  if (schema.description) md += `${schema.description}\n\n`;
  if (schema.type === 'object' || schema.properties) {
    md += `| ${ui('field', locale)} | ${ui('type', locale)} | ${ui('required', locale)} | ${ui('description', locale)} |\n|-------|------|-------------|----------|\n`;
    const required = new Set(schema.required || []);
    for (const [field, prop] of Object.entries(schema.properties || {})) {
      let type;
      if (prop.$ref) type = prop.$ref.split('/').pop();
      else if (prop.type === 'array') {
        type = `array<${
          prop.items?.$ref
            ? prop.items.$ref.split('/').pop()
            : prop.items?.type || 'any'
        }>`;
      } else if (prop.enum) type = `enum(${prop.enum.join(' \\| ')})`;
      else
        type =
          (prop.type || 'object') + (prop.format ? ` (${prop.format})` : '');
      md += `| \`${field}\` | ${type} | ${
        required.has(field) ? ui('yes', locale) : ui('no', locale)
      } | ${(prop.description || '').replace(/\|/g, '\\|')} |\n`;
    }
    md += '\n';
  } else if (schema.enum) {
    md += `**Enum:** ${schema.enum.map((e) => `\`${e}\``).join(', ')}\n\n`;
  }
  const example = schemaToJson(schemas, schema);
  md +=
    `**${ui('example', locale)}:**\n\n\`\`\`json\n` +
    JSON.stringify(example, null, 2) +
    '\n```\n';
  return md;
}

function schemaMarkdown(schemas, schema, locale) {
  if (!schema) return ui('noFormalContract', locale) + '\n';
  if (schema.$ref) {
    const r = resolveRef(schemas, schema.$ref);
    return schemaDetail(schemas, r.name, r.schema, locale);
  }
  if (schema.type === 'array' && schema.items?.$ref) {
    const r = resolveRef(schemas, schema.items.$ref);
    const arrayLabel = locale === 'en' ? 'array of' : 'array de';
    return (
      `**${ui('arrayOf', locale)}:** ${arrayLabel} \`${r.name}\`\n\n` +
      schemaDetail(schemas, r.name, r.schema, locale)
    );
  }
  if (schema.type === 'object' || schema.properties) {
    return schemaDetail(schemas, '(inline)', schema, locale);
  }
  return '```json\n' + JSON.stringify(schema, null, 2) + '\n```\n';
}

function resolveResponse(doc, resp) {
  if (!resp) return { description: '', schema: null, raw: resp };
  if (resp.$ref) {
    const name = resp.$ref.replace('#/components/responses/', '');
    const resolved = doc.components?.responses?.[name] || {};
    return {
      description: resolved.description || name,
      schema:
        resolved.content?.['application/json']?.schema ||
        (resolved.content && Object.values(resolved.content)[0]?.schema) ||
        null,
      raw: resolved,
    };
  }
  return {
    description: resp.description || '',
    schema: resp.content?.['application/json']?.schema || null,
    raw: resp,
  };
}

function getSuccessResponse(doc, op) {
  const codes = Object.keys(op.responses || {}).sort();
  const success = codes.find((c) => c.startsWith('2'));
  if (!success) return { code: null, schema: null, description: null };
  const resolved = resolveResponse(doc, op.responses[success]);
  return {
    code: success,
    schema: resolved.schema,
    description: resolved.description,
  };
}

function getRequestSchema(op) {
  return op.requestBody?.content?.['application/json']?.schema || null;
}

function concretePath(pathStr) {
  return pathStr
    .replace('{id}', '550e8400-e29b-41d4-a716-446655440000')
    .replace('{categoryId}', '550e8400-e29b-41d4-a716-446655440001')
    .replace('{productId}', '550e8400-e29b-41d4-a716-446655440002')
    .replace('{caseId}', '550e8400-e29b-41d4-a716-446655440003')
    .replace('{sellerId}', '550e8400-e29b-41d4-a716-446655440004')
    .replace('{userId}', '550e8400-e29b-41d4-a716-446655440005')
    .replace('{cep}', '01310100');
}

function isPublicOp(op) {
  return Array.isArray(op.security) && op.security.length === 0;
}

function needsAuth(op) {
  return !isPublicOp(op);
}

function authKind(method, pathStr, op) {
  if (isPublicOp(op)) return 'public';
  if (pathStr === '/users' && method === 'post') return 'admin';
  if (pathStr === '/users/{id}/groups') return 'admin';
  if (pathStr === '/users/{id}' && ['get', 'put', 'delete'].includes(method)) {
    return 'ownerOrAdmin';
  }
  if (
    /publish|verify$|assign|approve|reject|revoke|recompute|reconcile/.test(
      pathStr,
    ) ||
    (method !== 'get' &&
      /^\/(categories|products|services)/.test(pathStr) &&
      !pathStr.includes('price-history'))
  ) {
    if (method === 'get' && /categories|products|services/.test(pathStr)) {
      return 'public';
    }
    if (method !== 'get') return 'backoffice';
  }
  if (pathStr === '/listings/{id}/publish') return 'backoffice';
  if (pathStr === '/users' && method === 'get') return 'backoffice';
  if (pathStr === '/profiles' && method === 'get') return 'backoffice';
  if (pathStr === '/trust-events' && method === 'post') return 'backoffice';
  return 'bearer';
}

function relatedEndpoints(pathStr, locale) {
  let key = 'catalog';
  if (pathStr.startsWith('/auth')) key = 'auth';
  else if (pathStr.startsWith('/users')) key = 'users';
  else if (pathStr.startsWith('/listings')) key = 'listings';
  else if (pathStr.startsWith('/verification') || pathStr.startsWith('/seals'))
    key = 'verification';
  else if (pathStr.startsWith('/search') || pathStr.startsWith('/synonyms'))
    key = 'search';
  else if (pathStr.startsWith('/favorites')) key = 'favorites';
  else if (pathStr.startsWith('/media')) key = 'media';
  else if (pathStr.startsWith('/profiles')) key = 'profiles';
  else if (pathStr.startsWith('/cep')) key = 'cep';
  else if (pathStr.startsWith('/trust') || pathStr.startsWith('/seller-levels'))
    key = 'trust';
  else if (
    pathStr.startsWith('/categories') ||
    pathStr.startsWith('/products') ||
    pathStr.startsWith('/services')
  )
    key = 'catalog';
  return (RELATED[key] || []).map((item) => pick(item, locale));
}

function typicalErrorBody(code, locale) {
  if (code === '401') {
    return {
      error: locale === 'en' ? 'Unauthorized.' : 'Não autorizado.',
      code: 'AUTH_UNAUTHORIZED',
    };
  }
  if (code === '403') return { error: 'Access denied' };
  if (code === '429') return { error: 'Too many requests' };
  return {
    error:
      locale === 'en'
        ? 'Translated catalog message'
        : 'Mensagem traduzida do catálogo',
    code: 'FIELD_INVALID',
  };
}

function curlExample(schemas, method, pathStr, op) {
  let p = concretePath(pathStr);
  const params = op.parameters || [];
  const query = params.filter((x) => x.in === 'query');
  if (query.length) {
    const qs = query
      .map(
        (q) =>
          `${q.name}=${encodeURIComponent(
            String(exampleFromProp(schemas, q.schema) ?? 'value'),
          )}`,
      )
      .join('&');
    p += `?${qs}`;
  }

  const lines = [
    `curl -X ${method.toUpperCase()} '${BASE_URL}${p}' \\`,
    `  -H 'Accept: application/json'`,
  ];

  if (needsAuth(op)) {
    lines.push(`  -H 'Authorization: Bearer <access_token>'`);
  }

  const reqSchema = getRequestSchema(op);
  if (reqSchema && ['post', 'put', 'patch'].includes(method)) {
    lines.push(`  -H 'Content-Type: application/json'`);
    const body = schemaToJson(schemas, reqSchema);
    lines.push(`  -d '${JSON.stringify(body, null, 2)}'`);
  }

  return lines
    .map((line, i) =>
      i < lines.length - 1
        ? line.endsWith('\\')
          ? line
          : line + ' \\'
        : line.replace(/\s*\\$/, ''),
    )
    .join('\n');
}

function writeLocale(locale, doc, schemas, operations) {
  const OUT = OUT_BY_LOCALE[locale];
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const byDomain = {};

  for (const opRec of operations) {
    const { pathStr, method, op, domain, resource, folder, success, reqSchema, params, errorEntries } =
      opRec;
    const dir = path.join(OUT, domain, resource, folder);
    fs.mkdirSync(dir, { recursive: true });

    const errors = errorEntries
      .map(([c, r]) => {
        const resolved = resolveResponse(doc, r);
        return `- **${c}** — ${resolved.description || ''}`;
      })
      .join('\n');
    const gain = productGain(domain, pathStr, locale);
    const auth = pick(AUTH_MATRIX[authKind(method, pathStr, op)], locale);
    const related = relatedEndpoints(pathStr, locale);
    const moduleDoc = DOMAIN_TO_MODULE_DOC[domain] || domain;

    let readme = `# ${op.summary || `${method.toUpperCase()} ${pathStr}`}\n\n`;
    readme += `| | |\n|--|--|\n`;
    readme += `| **${ui('domain', locale)}** | \`${domain}\` |\n`;
    readme += `| **${ui('openApiTag', locale)}** | ${op.tags?.[0] || ''} |\n`;
    readme += `| **${ui('method', locale)}** | \`${method.toUpperCase()}\` |\n`;
    readme += `| **${ui('path', locale)}** | \`${pathStr}\` |\n`;
    readme += `| **${ui('successStatus', locale)}** | \`${success.code || '—'}\` |\n`;
    readme += `| **${ui('authorization', locale)}** | ${auth} |\n\n`;
    readme += `## ${ui('whatItDoes', locale)}\n\n${op.description || gain}\n\n`;
    readme += `## ${ui('productGain', locale)}\n\n${gain}\n\n`;
    readme += `## ${ui('howRelated', locale)}\n\n`;
    for (const item of related) readme += `- ${item}\n`;
    readme += `\n- ${ui('moduleGuide', locale)}: [${moduleDoc}](../../../../modules/${moduleDoc}.md)\n`;
    readme += `- ${ui('httpConventions', locale)}: [http-conventions.md](../../../../architecture/http-conventions.md)\n\n`;
    readme += `## ${ui('contractFiles', locale)}\n\n`;
    readme += `- [curl.sh](./curl.sh)\n`;
    readme += `- [request.md](./request.md)\n`;
    readme += `- [response.md](./response.md)\n`;
    readme += `- [parameters.md](./parameters.md)\n`;
    readme += `- [examples.md](./examples.md)\n`;
    fs.writeFileSync(path.join(dir, 'README.md'), readme);

    fs.writeFileSync(
      path.join(dir, 'curl.sh'),
      `#!/usr/bin/env bash\n# ${op.summary || ''}\n${curlExample(
        schemas,
        method,
        pathStr,
        op,
      )}\n`,
      { mode: 0o755 },
    );

    let inputMd =
      locale === 'en'
        ? `# Request — ${op.summary || pathStr}\n\n`
        : `# Contrato de entrada — ${op.summary || pathStr}\n\n`;
    if (!reqSchema) {
      inputMd += ui('noRequestBody', locale) + '\n\n';
      if (params.length) inputMd += ui('seeParameters', locale) + '\n';
    } else {
      inputMd += schemaMarkdown(schemas, reqSchema, locale);
    }
    fs.writeFileSync(path.join(dir, 'request.md'), inputMd);

    let outMd =
      locale === 'en'
        ? `# Response — ${op.summary || pathStr}\n\n`
        : `# Contrato de saída — ${op.summary || pathStr}\n\n`;
    outMd += `**HTTP ${success.code || '—'}** — ${success.description || ''}\n\n`;
    if (success.schema) outMd += schemaMarkdown(schemas, success.schema, locale);
    else if (success.code === '204') outMd += ui('noBody204', locale) + '\n';
    else outMd += ui('noResponseSchema', locale) + '\n';
    if (errors) {
      outMd += `\n## ${ui('documentedErrors', locale)}\n\n${errors}\n\n`;
      for (const [c, r] of errorEntries) {
        const resolved = resolveResponse(doc, r);
        outMd += `### HTTP ${c}\n\n${resolved.description}\n\n`;
        outMd += `**${ui('example', locale)}:**\n\n\`\`\`json\n`;
        if (resolved.schema) {
          outMd += JSON.stringify(schemaToJson(schemas, resolved.schema), null, 2);
        } else {
          outMd += JSON.stringify(typicalErrorBody(c, locale), null, 2);
        }
        outMd += '\n```\n\n';
        const hint = FRONT_ERROR[c] || FRONT_ERROR.default;
        outMd += `${pick(hint, locale)}\n\n`;
      }
    }
    fs.writeFileSync(path.join(dir, 'response.md'), outMd);

    let paramMd =
      locale === 'en'
        ? `# Parameters — ${op.summary || pathStr}\n\n`
        : `# Parâmetros — ${op.summary || pathStr}\n\n`;
    if (!params.length) {
      paramMd += ui('noPathQuery', locale) + '\n\n';
    } else {
      paramMd += `| ${ui('nameCol', locale)} | ${ui('inCol', locale)} | ${ui('required', locale)} | ${ui('type', locale)} | ${ui('description', locale)} |\n|------|----|-------------|------|----------|\n`;
      for (const p of params) {
        const type = p.schema?.$ref
          ? p.schema.$ref.split('/').pop()
          : p.schema?.enum
            ? `enum(${p.schema.enum.join(' \\| ')})`
            : (p.schema?.type || 'string') +
              (p.schema?.format ? ` (${p.schema.format})` : '');
        paramMd += `| \`${p.name}\` | ${p.in} | ${
          p.required ? ui('yes', locale) : ui('no', locale)
        } | ${type} | ${(p.description || '').replace(/\|/g, '\\|')} |\n`;
      }
      paramMd += '\n';
    }
    paramMd += `## ${ui('recommendedHeaders', locale)}\n\n`;
    paramMd += `| ${ui('header', locale)} | ${ui('when', locale)} | ${ui('example', locale)} |\n|--------|--------|--------|\n`;
    paramMd += `| \`Accept\` | ${ui('always', locale)} | \`application/json\` |\n`;
    if (reqSchema)
      paramMd += `| \`Content-Type\` | ${ui('withBody', locale)} | \`application/json\` |\n`;
    if (needsAuth(op))
      paramMd += `| \`Authorization\` | ${ui('requiredOnEndpoint', locale)} | \`Bearer <access_token>\` |\n`;
    paramMd += `\n${ui('doNotSendActorHeaders', locale)}\n`;
    fs.writeFileSync(path.join(dir, 'parameters.md'), paramMd);

    let uso =
      locale === 'en'
        ? `# Examples — ${op.summary || pathStr}\n\n`
        : `# Exemplos de uso — ${op.summary || pathStr}\n\n`;
    uso += `## ${ui('whenToCall', locale)}\n\n${gain}\n\n`;
    uso += `## ${ui('authorization', locale)}\n\n${auth}\n\n`;
    uso += `## ${ui('typicalSequence', locale)}\n\n`;
    uso += `1. ${ui('stepBuildUrl', locale)}\n`;
    uso += reqSchema
      ? `2. ${ui('stepValidateBody', locale)}\n`
      : `2. ${ui('stepNoBody', locale)}\n`;
    uso += `3. ${ui('stepSuccess', locale)}\n`;
    uso += `4. ${ui('stepErrors', locale)}\n\n`;
    uso += `## ${ui('fetchTs', locale)}\n\n\`\`\`ts\n`;
    const fetchPath = concretePath(pathStr);
    uso += `const res = await fetch('${BASE_URL}${fetchPath}', {\n`;
    uso += `  method: '${method.toUpperCase()}',\n`;
    uso += `  headers: {\n    Accept: 'application/json',\n`;
    if (reqSchema) uso += `    'Content-Type': 'application/json',\n`;
    if (needsAuth(op))
      uso += `    Authorization: \`Bearer \${accessToken}\`,\n`;
    uso += `  },\n`;
    if (reqSchema) {
      const body = schemaToJson(schemas, reqSchema);
      uso += `  body: JSON.stringify(${JSON.stringify(body, null, 2)}),\n`;
    }
    uso += `});\n`;
    uso += `if (!res.ok) throw await res.json();\n`;
    if (success.code === '204') {
      uso += `${ui('noJson204', locale)}\n`;
    } else {
      uso += `const data = await res.json();\n`;
    }
    uso += `\`\`\`\n\n`;
    uso += `## cURL\n\n${ui('seeCurl', locale)}\n`;
    fs.writeFileSync(path.join(dir, 'examples.md'), uso);

    if (!byDomain[domain]) {
      byDomain[domain] = {
        gain: pick(PRODUCT_GAIN[domain]?.domain, locale),
        endpoints: [],
      };
    }
    byDomain[domain].endpoints.push({
      method: method.toUpperCase(),
      path: pathStr,
      summary: op.summary || '',
      folder: path.join(domain, resource, folder),
      resource,
    });
  }

  for (const [domain, info] of Object.entries(byDomain)) {
    let md = `# ${ui('domainTitle', locale)}: ${domain}\n\n`;
    md += `## ${ui('productGain', locale)}\n\n${info.gain}\n\n`;
    md += `## ${ui('endpoints', locale)} (${info.endpoints.length})\n\n`;
    md += `| ${ui('method', locale)} | ${ui('path', locale)} | ${ui('summary', locale)} | ${ui('contract', locale)} |\n|--------|------|--------|----------|\n`;
    for (const e of info.endpoints.sort(
      (a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method),
    )) {
      const rel = e.folder.split('/').slice(1).join('/');
      md += `| \`${e.method}\` | \`${e.path}\` | ${e.summary} | [${ui('open', locale)}](./${rel}/) |\n`;
    }
    const resources = [...new Set(info.endpoints.map((e) => e.resource))];
    md += `\n## ${ui('resources', locale)}\n\n`;
    for (const r of resources) md += `- [\`${r}/\`](./${r}/)\n`;
    fs.writeFileSync(path.join(OUT, domain, 'README.md'), md);

    for (const r of resources) {
      const eps = info.endpoints.filter((e) => e.resource === r);
      let rmd = `# ${ui('resource', locale)}: ${r}\n\n${ui('domainTitle', locale)}: \`${domain}\`\n\n| ${ui('method', locale)} | ${ui('path', locale)} | ${ui('contract', locale)} |\n|--------|------|----------|\n`;
      for (const e of eps) {
        const leaf = e.folder.split('/').pop();
        rmd += `| \`${e.method}\` | \`${e.path}\` | [${e.summary || leaf}](./${leaf}/) |\n`;
      }
      fs.writeFileSync(path.join(OUT, domain, r, 'README.md'), rmd);
    }
  }

  const schemasDir = path.join(OUT, '_schemas');
  fs.mkdirSync(schemasDir, { recursive: true });
  for (const [name, schema] of Object.entries(schemas)) {
    fs.writeFileSync(
      path.join(schemasDir, `${name}.md`),
      `# ${ui('schemaLabel', locale)}: ${name}\n\n` +
        schemaDetail(schemas, name, schema, locale),
    );
  }
  fs.writeFileSync(
    path.join(schemasDir, 'README.md'),
    `# ${ui('schemasTitle', locale)}\n\n${ui('schemasMirror', locale)}\n\n${ui('total', locale)}: **${
      Object.keys(schemas).length
    }** schemas.\n\n` +
      Object.keys(schemas)
        .sort()
        .map((n) => `- [${n}](./${n}.md)`)
        .join('\n') +
      '\n',
  );

  const count = operations.length;
  let indexMd = `# ${ui('indexTitle', locale)}\n\n`;
  indexMd += `${ui('indexIntro', locale)}\n\n`;
  indexMd += `| | |\n|--|--|\n`;
  indexMd += `| **${ui('source', locale)}** | [\`src/contracts/service.yaml\`](${SPEC_DOC_LINK}) |\n`;
  indexMd += `| **${ui('localBaseUrl', locale)}** | \`${BASE_URL}\` |\n`;
  indexMd += `| **${ui('documentedEndpoints', locale)}** | **${count}** |\n`;
  indexMd += `| **Schemas** | **${Object.keys(schemas).length}** — [_schemas/](./_schemas/) |\n`;
  indexMd += `| **${ui('generatedOn', locale)}** | ${new Date().toISOString().slice(0, 10)} |\n`;
  indexMd += `| **${ui('otherLocale', locale)}** | [${ui('otherLocale', locale)}](${ui('otherLocaleHref', locale)}) |\n\n`;
  indexMd += `## ${ui('startHere', locale)}\n\n`;
  indexMd += `- [${ui('projectDocs', locale)}](../README.md)\n`;
  indexMd += `- [${ui('httpConventions', locale)}](../architecture/http-conventions.md)\n`;
  indexMd += `- [${locale === 'en' ? 'How to document an endpoint' : 'Como documentar um endpoint'}](../contributing.md)\n\n`;
  indexMd += `## ${ui('domains', locale)}\n\n`;
  indexMd += `| ${ui('domainTitle', locale)} | ${ui('endpoints', locale)} | ${ui('folder', locale)} |\n|---------|-----------|-------|\n`;
  for (const d of Object.keys(byDomain).sort()) {
    indexMd += `| **${d}** | ${byDomain[d].endpoints.length} | [${d}/](./${d}/) |\n`;
  }
  indexMd += `\n## ${ui('fullIndex', locale)}\n\n`;
  indexMd += `| ${ui('domainTitle', locale)} | ${ui('method', locale)} | ${ui('path', locale)} | ${ui('summary', locale)} | ${ui('folder', locale)} |\n|---------|--------|------|--------|-------|\n`;
  for (const d of Object.keys(byDomain).sort()) {
    for (const e of byDomain[d].endpoints.sort(
      (a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method),
    )) {
      indexMd += `| ${d} | \`${e.method}\` | \`${e.path}\` | ${e.summary} | [${e.folder}](./${e.folder}/) |\n`;
    }
  }
  indexMd += `\n## ${ui('structure', locale)}\n\n\`\`\`text\ndocs/${locale}/api/<module>/<resource>/<method-path>/\n  README.md       # summary + product + module links\n  curl.sh         # ready-to-run curl (same in both locales)\n  request.md      # request body\n  response.md     # success + errors\n  parameters.md   # path/query/headers\n  examples.md     # fetch TS + client flow\n\`\`\`\n\n`;
  indexMd += `## ${ui('productRules', locale)}\n\n`;
  if (locale === 'en') {
    indexMd += `1. **Trust > volume** — never show a seal/verification without a completed API status.\n`;
    indexMd += `2. **Product ≠ Offer** — \`/products\` is the model; \`/listings\` is the unit/offer.\n`;
    indexMd += `3. **AI does not invent** — attributes come from \`attribute-schema\` and the response; do not fill gaps.\n`;
    indexMd += `4. **TrustScore with reasons** — use returned events/score; do not reduce to a color without text.\n`;
    indexMd += `5. **Identity only in the JWT** — never spoof \`x-user-id\` / \`x-user-groups\`.\n`;
    indexMd += `6. **Public signup** is \`POST /auth/register\`, not \`POST /users\` (ADMIN).\n\n`;
  } else {
    indexMd += `1. **Confiança > volume** — nunca exibir selo/verificação sem status concluído da API.\n`;
    indexMd += `2. **Produto ≠ Oferta** — \`/products\` é modelo; \`/listings\` é unidade/oferta.\n`;
    indexMd += `3. **IA não inventa** — atributos vêm de \`attribute-schema\` e da resposta; não preencher gaps.\n`;
    indexMd += `4. **TrustScore com motivo** — usar eventos/score retornados; não reduzir a cor sem texto.\n`;
    indexMd += `5. **Identidade só no JWT** — nunca spoofar \`x-user-id\` / \`x-user-groups\`.\n`;
    indexMd += `6. **Cadastro público** é \`POST /auth/register\`, não \`POST /users\` (este é ADMIN).\n\n`;
  }
  indexMd += `## ${ui('howToRegen', locale)}\n\n\`\`\`bash\nyarn docs:api\n\`\`\`\n`;

  fs.writeFileSync(path.join(OUT, 'README.md'), indexMd);
  fs.writeFileSync(path.join(OUT, 'INDEX.md'), indexMd);

  return { count, domains: Object.fromEntries(Object.entries(byDomain).map(([k, v]) => [k, v.endpoints.length])) };
}

function main() {
  const doc = yaml.load(fs.readFileSync(SPEC, 'utf8'));
  const schemas = doc.components?.schemas || {};
  const operations = [];

  for (const [pathStr, methods] of Object.entries(doc.paths || {})) {
    for (const [method, op] of Object.entries(methods)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
      const tag = (op.tags && op.tags[0]) || 'Misc';
      const domain = domainFromTag(tag);
      const resource = resourceFromPath(pathStr);
      const folder = opFolderName(method, pathStr);
      const success = getSuccessResponse(doc, op);
      const reqSchema = getRequestSchema(op);
      const params = op.parameters || [];
      const errorEntries = Object.entries(op.responses || {}).filter(
        ([c]) => !c.startsWith('2'),
      );
      operations.push({
        pathStr,
        method,
        op,
        tag,
        domain,
        resource,
        folder,
        success,
        reqSchema,
        params,
        errorEntries,
      });
    }
  }

  const reports = {};
  for (const locale of LOCALES) {
    reports[locale] = writeLocale(locale, doc, schemas, operations);
  }

  console.log(
    JSON.stringify(
      {
        count: operations.length,
        schemas: Object.keys(schemas).length,
        locales: reports,
      },
      null,
      2,
    ),
  );
}

main();

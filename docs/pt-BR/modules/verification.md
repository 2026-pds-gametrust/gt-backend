# Verificação

Casos, evidências e selos. API: [verification](../api/verification/). Inglês: [en](../../en/modules/verification.md).

Entidades: [verification-case](../../entities/verification-case/) · [evidence-item](../../entities/evidence-item/) · [seal](../../entities/seal/).

Spec: [listing-moderation-revision-flow](../../specs/listing-moderation-revision-flow/requirements.md).

## Papel

Diferencial de confiança. Selo **nunca** é decoração de UI. Mostre só quando a API devolver selo ativo/concedido daquele listing.

## Fluxo

```text
POST /listings/{id}/submit              → abre / alimenta o caso
GET  /verification-cases                → fila de moderação (filtros, busca, score IA)
POST /verification-cases/{id}/assign
POST /verification-cases/{id}/approve → habilita publish + concessão de selo
POST /verification-cases/{id}/request-changes → correções granulares; listing volta a DRAFT
POST /verification-cases/{id}/reject  → rejeição definitiva; listing vai a REJECTED
POST /seals/{id}/revoke                 → remove o sinal de confiança na hora
```

### Pedir correções vs rejeitar

| Decisão | Status do caso | Listing | Vendedor |
|---------|----------------|---------|----------|
| **Request changes** | `CHANGES_REQUESTED` (terminal) | `SUBMITTED → DRAFT` | Edita e reenvia; `GET /listings/mine` expõe `requiredChanges` |
| **Reject** | `REJECTED` (terminal) | `SUBMITTED → REJECTED` | Sem resubmit; motivo em `decisionReason` |

`request-changes` exige `summary` + ≥1 `requiredChange` com alvo `PHOTO` | `VIDEO` | `DESCRIPTION`. Foto/vídeo exigem `assetId` do listing. O caso guarda `revisionBaseline` (snapshot) para validar o reenvio.

Reenvio válido abre novo caso `PENDING` com `previousCaseId` apontando para o caso anterior.

Mídia de evidência é **restrita** (bucket privado, URLs pré-assinadas). Páginas públicas usam o resumo revisado, não a evidência crua.

## Fila de moderação

`GET /verification-cases` (backoffice) suporta:

- `status`, `q` (case, listing, vendedor), `moderatorId`
- `minScore` / `maxScore` — score IA em `checklist.aiAnalysis` (0–100)
- `hasAiScore` — filtrar casos com/sem score IA
- paginação (`limit`, `offset`) e estatísticas agregadas na resposta

## Regras de produto

- Sem ícone/cor de selo sem `GRANTED` (ou status equivalente da API).
- Motivos de rejeição e pedidos de correção precisam ser acionáveis para o vendedor.
- IA pode sugerir score/checklist; **moderador confirma** — nunca auto-decide approve/reject/request-changes.
- Verify de identidade (`POST /users/{id}/verify`) não é selo de anúncio.

## Eventos

| Evento | Quando | Consumer ligado |
|--------|--------|-----------------|
| `verification.case.submitted` | Caso aberto | ainda não |
| `verification.case.approved` | Aprovação do revisor | listings auto-publish |
| `verification.case.changes_requested` | Correções pedidas | listings `SUBMITTED→DRAFT` |
| `verification.case.rejected` | Rejeição definitiva | listings `SUBMITTED→REJECTED` |
| `verification.seal.granted` / `.revoked` | Ciclo do selo | search reindex (selo visível) |

Consome: `listings.listing.submitted` (e `status_changed` para `SUBMITTED`) → abre caso, idempotente.

Evidência usa **`IMediaClient`** (purpose restrito). Não coloque código de posse nem PII nos eventos.

## Relacionados

- [Listings](./listings.md) · [Mensageria](../architecture/messaging.md)
- API: [verification](../api/verification/)

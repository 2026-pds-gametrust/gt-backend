# Como contribuir com a documentação

Como manter docs de projeto, páginas de API HTTP e DeepWiki alinhados. Inglês: [en](../en/contributing.md).

O inglês é normativo para identificadores, paths e `ARCH-*` / `DEC-*`. Atualize **os dois** `docs/en/` e `docs/pt-BR/` nas páginas publicadas. Em conflito, o inglês vence.

## Superfícies

| Superfície | Você edita | Gerado? |
|------------|------------|---------|
| Docs de projeto | `docs/en/**`, `docs/pt-BR/**` (exceto `api/`) | Não |
| API HTTP | Overlay em `scripts/generate-frontend-api-docs.js` + `src/contracts/service.yaml` | Sim — `yarn docs:api` |
| Canon de arquitetura | `docs/architecture/`, `docs/entities/` | Não (agents citam) |
| DeepWiki | `.devin/wiki.json` | Wiki gerada pelo Devin / deepwiki.com |

Não traduza `docs/specs/`, `docs/ralph/` nem `docs/audits/`.

## Como documentar um endpoint

1. Altere a rota, body, query ou resposta no código **e** em [`src/contracts/service.yaml`](../../src/contracts/service.yaml).
2. Documente `security` na operação (`[]` = público; senão Bearer). Toda rota precisa de decisão explícita de autorização.
3. Atualize o overlay de produto (`PRODUCT_GAIN`) em [`scripts/generate-frontend-api-docs.js`](../../scripts/generate-frontend-api-docs.js) em **en** e **pt-BR** se o summary OpenAPI não bastar para o front.
4. Rode:

   ```bash
   yarn docs:api
   ```

5. Confirme a pasta em `docs/en/api/<modulo>/<recurso>/<metodo-path>/` e o espelho pt-BR.
6. Linke a operação no guia do módulo (`docs/pt-BR/modules/<modulo>.md`) se for um recurso novo.
7. Se a mudança for arquitetural (módulo, evento, regra de auth), atualize `docs/architecture/` (`ARCH-*` / `DEC-*`) e as páginas em `docs/en/architecture/` e `docs/pt-BR/architecture/` — em especial [comunicação](./architecture/communication.md) e [mensageria](./architecture/messaging.md).
8. Evento de domínio novo: siga [mensageria §Como adicionar um evento](./architecture/messaging.md#como-adicionar-um-evento) (envelope, handler no Service consumidor, `DomainEventRouterFactory`, os dois locales).
9. O **DeepWiki** não ganha uma página por endpoint. Depois de mudança relevante de arquitetura ou módulo, regenere o wiki (abaixo).

Arquivos gerados por operação (mesmos nomes nos dois locales):

```text
README.md       # resumo, auth, ganho de produto, links ao módulo
request.md      # request body
response.md     # body de sucesso + erros
parameters.md   # path / query / headers
examples.md     # fetch + o que o cliente deve fazer
curl.sh         # idêntico em EN e pt-BR
```

Não edite à mão arquivos em `docs/en/api/` ou `docs/pt-BR/api/` — são sobrescritos.

## DeepWiki

Arquivo: [`.devin/wiki.json`](../../.devin/wiki.json).

- `repo_notes` direcionam a geração (GamerTrust, OpenAPI como fonte, SQS/SNS, grafia das camadas).
- `pages` é lista **exclusiva** (máx. 30). Incluir uma página nova implica listar **todas**, não só a nova.
- Língua: inglês (o wiki é gerado a partir do código).
- Repos privados: conectar na org Devin e regenerar na UI do wiki.
- Repos públicos: trocar `github.com` por `deepwiki.com` na URL, ou enviar em [deepwiki.com](https://deepwiki.com/).

Depois de alterar `.devin/wiki.json` ou docs de arquitetura importantes, regenere o wiki para as respostas do chat continuarem ancoradas.

## Checklist de PR de docs

- [ ] `service.yaml` alinhado ao controller se o HTTP mudou
- [ ] `yarn docs:api` executado; os dois locales atualizados
- [ ] Guia do módulo aponta a operação nova
- [ ] Regras de produto (sem selo falso, Produto ≠ Oferta)
- [ ] Sem segredos nem PII nos exemplos

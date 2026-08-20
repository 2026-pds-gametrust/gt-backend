# Segurança

Contrato mínimo para HTTP e domínio. Canon: [docs/architecture/07-security.md](../../architecture/07-security.md) (ARCH-007). Baseline: [`.cursor/rules/rule.security-baseline.mdc`](../../../.cursor/rules/rule.security-baseline.mdc). Inglês: [en](../../en/architecture/security.md).

## Divisão

| Camada | Faz | Não faz |
|--------|-----|---------|
| Application | JWT, `authorizeByGroup`, shape OpenAPI, `ActorContext` | Ownership (“este anúncio é deles”) |
| Domain (Service) | Ownership, permissões por estado | Parse de token ou confiança em id do `req` |
| Infraestructure | I/O com menor privilégio | Decisões de autorização |
| Configuration | Constantes nomeadas de env | Segredos no código |

## AuthN

JWT de acesso first-party (curta duração) + refresh opaco, hash em descanso, rotação no uso. Reuso de refresh revogado derruba a família da sessão. Cognito não é usado.

Groups HTTP neste código: `app-user`, `partner`, `admin`, `backoffice` (`EUserGroup`), mais `SYSTEM` fora do HTTP.

## Dados

- Nunca logar tokens, senhas, headers de autorização, documentos completos ou PII.
- Mídia de evidência e códigos de posse são **restritos**: bucket privado, URLs pré-assinadas, códigos com hash.
- Eventos não carregam PII.

## Entrada

Nenhum `req.query` / `req.body` cru em filtro Mongoose. Sem URL de saída controlada pelo usuário (SSRF). Erros nunca vazam stack nem internos do Mongo.

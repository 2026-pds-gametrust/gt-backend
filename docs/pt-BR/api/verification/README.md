# Domínio: verification

## Ganho no produto

Verificação e selos são o diferencial de confiança. Nunca exibir selo sem caso concluído.

## Endpoints (14)

| Método | Path | Resumo | Contrato |
|--------|------|--------|----------|
| `GET` | `/listings/{listingId}/proof-code` | Ensure open case and retrieve possession proof code for a listing | [abrir](./listings/get-listings-by-listingId-proof-code/) |
| `GET` | `/seals` | List seals by listingId | [abrir](./seals/get-seals/) |
| `GET` | `/seals/{id}` | Get seal by id | [abrir](./seals/get-seals-by-id/) |
| `POST` | `/seals/{id}/revoke` | Revoke an active seal (backoffice) | [abrir](./seals/post-seals-by-id-revoke/) |
| `GET` | `/verification-cases` | List verification cases for moderation | [abrir](./verification-cases/get-verification-cases/) |
| `POST` | `/verification-cases` | Open verification case for listing | [abrir](./verification-cases/post-verification-cases/) |
| `GET` | `/verification-cases/{caseId}/evidence` | List evidence metadata for a case | [abrir](./verification-cases/get-verification-cases-by-caseId-evidence/) |
| `POST` | `/verification-cases/{caseId}/evidence` | Add evidence metadata to a case | [abrir](./verification-cases/post-verification-cases-by-caseId-evidence/) |
| `GET` | `/verification-cases/{id}` | Get verification case by id | [abrir](./verification-cases/get-verification-cases-by-id/) |
| `POST` | `/verification-cases/{id}/approve` | Approve case and grant seal (backoffice) | [abrir](./verification-cases/post-verification-cases-by-id-approve/) |
| `POST` | `/verification-cases/{id}/assign` | Assign reviewer (backoffice) | [abrir](./verification-cases/post-verification-cases-by-id-assign/) |
| `GET` | `/verification-cases/{id}/proof-code` | Retrieve possession proof code plaintext for an open case | [abrir](./verification-cases/get-verification-cases-by-id-proof-code/) |
| `POST` | `/verification-cases/{id}/reject` | Reject verification case (backoffice) | [abrir](./verification-cases/post-verification-cases-by-id-reject/) |
| `POST` | `/verification-cases/{id}/request-changes` | Request granular listing changes (backoffice) | [abrir](./verification-cases/post-verification-cases-by-id-request-changes/) |

## Recursos

- [`listings/`](./listings/)
- [`seals/`](./seals/)
- [`verification-cases/`](./verification-cases/)

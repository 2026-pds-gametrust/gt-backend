# Resource: verification-cases

Domain: `verification`

| Method | Path | Contract |
|--------|------|----------|
| `GET` | `/verification-cases` | [List verification cases for moderation](./get-verification-cases/) |
| `POST` | `/verification-cases` | [Open verification case for listing](./post-verification-cases/) |
| `GET` | `/verification-cases/{caseId}/evidence` | [List evidence metadata for a case](./get-verification-cases-by-caseId-evidence/) |
| `POST` | `/verification-cases/{caseId}/evidence` | [Add evidence metadata to a case](./post-verification-cases-by-caseId-evidence/) |
| `GET` | `/verification-cases/{id}` | [Get verification case by id](./get-verification-cases-by-id/) |
| `POST` | `/verification-cases/{id}/approve` | [Approve case and grant seal (backoffice)](./post-verification-cases-by-id-approve/) |
| `POST` | `/verification-cases/{id}/assign` | [Assign reviewer (backoffice)](./post-verification-cases-by-id-assign/) |
| `POST` | `/verification-cases/{id}/reject` | [Reject verification case (backoffice)](./post-verification-cases-by-id-reject/) |
| `POST` | `/verification-cases/{id}/request-changes` | [Request granular listing changes (backoffice)](./post-verification-cases-by-id-request-changes/) |

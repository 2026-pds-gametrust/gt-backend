# Domain: verification

## Product value

Verification and seals are the trust differentiator. Never show a seal without a completed case.

## Endpoints (14)

| Method | Path | Summary | Contract |
|--------|------|--------|----------|
| `GET` | `/listings/{listingId}/proof-code` | Ensure open case and retrieve possession proof code for a listing | [open](./listings/get-listings-by-listingId-proof-code/) |
| `GET` | `/seals` | List seals by listingId | [open](./seals/get-seals/) |
| `GET` | `/seals/{id}` | Get seal by id | [open](./seals/get-seals-by-id/) |
| `POST` | `/seals/{id}/revoke` | Revoke an active seal (backoffice) | [open](./seals/post-seals-by-id-revoke/) |
| `GET` | `/verification-cases` | List verification cases for moderation | [open](./verification-cases/get-verification-cases/) |
| `POST` | `/verification-cases` | Open verification case for listing | [open](./verification-cases/post-verification-cases/) |
| `GET` | `/verification-cases/{caseId}/evidence` | List evidence metadata for a case | [open](./verification-cases/get-verification-cases-by-caseId-evidence/) |
| `POST` | `/verification-cases/{caseId}/evidence` | Add evidence metadata to a case | [open](./verification-cases/post-verification-cases-by-caseId-evidence/) |
| `GET` | `/verification-cases/{id}` | Get verification case by id | [open](./verification-cases/get-verification-cases-by-id/) |
| `POST` | `/verification-cases/{id}/approve` | Approve case and grant seal (backoffice) | [open](./verification-cases/post-verification-cases-by-id-approve/) |
| `POST` | `/verification-cases/{id}/assign` | Assign reviewer (backoffice) | [open](./verification-cases/post-verification-cases-by-id-assign/) |
| `GET` | `/verification-cases/{id}/proof-code` | Retrieve possession proof code plaintext for an open case | [open](./verification-cases/get-verification-cases-by-id-proof-code/) |
| `POST` | `/verification-cases/{id}/reject` | Reject verification case (backoffice) | [open](./verification-cases/post-verification-cases-by-id-reject/) |
| `POST` | `/verification-cases/{id}/request-changes` | Request granular listing changes (backoffice) | [open](./verification-cases/post-verification-cases-by-id-request-changes/) |

## Resources

- [`listings/`](./listings/)
- [`seals/`](./seals/)
- [`verification-cases/`](./verification-cases/)

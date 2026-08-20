# Domínio: listingchat

## Ganho no produto



## Endpoints (10)

| Método | Path | Resumo | Contrato |
|--------|------|--------|----------|
| `GET` | `/chat-reports` | List chat reports (backoffice/admin) | [abrir](./chat-reports/get-chat-reports/) |
| `GET` | `/conversations` | List conversations for the authenticated actor | [abrir](./conversations/get-conversations/) |
| `POST` | `/conversations` | Open or resume a conversation for a published listing | [abrir](./conversations/post-conversations/) |
| `GET` | `/conversations/{conversationId}` | Get conversation detail (participant only) | [abrir](./conversations/get-conversations-by-conversationId/) |
| `POST` | `/conversations/{conversationId}/block` | Block the other participant across listing conversations | [abrir](./conversations/post-conversations-by-conversationId-block/) |
| `GET` | `/conversations/{conversationId}/messages` | Paginated message history (participant only) | [abrir](./conversations/get-conversations-by-conversationId-messages/) |
| `POST` | `/conversations/{conversationId}/messages` | Send a text message (participant only) | [abrir](./conversations/post-conversations-by-conversationId-messages/) |
| `POST` | `/conversations/{conversationId}/messages/{messageId}/reports` | Report a specific message | [abrir](./conversations/post-conversations-by-conversationId-messages-by-messageId-reports/) |
| `POST` | `/conversations/{conversationId}/read` | Mark conversation as read for the actor | [abrir](./conversations/post-conversations-by-conversationId-read/) |
| `POST` | `/conversations/{conversationId}/reports` | Report a conversation | [abrir](./conversations/post-conversations-by-conversationId-reports/) |

## Recursos

- [`chat-reports/`](./chat-reports/)
- [`conversations/`](./conversations/)

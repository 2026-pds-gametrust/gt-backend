# Domain: listingchat

## Product value



## Endpoints (10)

| Method | Path | Summary | Contract |
|--------|------|--------|----------|
| `GET` | `/chat-reports` | List chat reports (backoffice/admin) | [open](./chat-reports/get-chat-reports/) |
| `GET` | `/conversations` | List conversations for the authenticated actor | [open](./conversations/get-conversations/) |
| `POST` | `/conversations` | Open or resume a conversation for a published listing | [open](./conversations/post-conversations/) |
| `GET` | `/conversations/{conversationId}` | Get conversation detail (participant only) | [open](./conversations/get-conversations-by-conversationId/) |
| `POST` | `/conversations/{conversationId}/block` | Block the other participant across listing conversations | [open](./conversations/post-conversations-by-conversationId-block/) |
| `GET` | `/conversations/{conversationId}/messages` | Paginated message history (participant only) | [open](./conversations/get-conversations-by-conversationId-messages/) |
| `POST` | `/conversations/{conversationId}/messages` | Send a text message (participant only) | [open](./conversations/post-conversations-by-conversationId-messages/) |
| `POST` | `/conversations/{conversationId}/messages/{messageId}/reports` | Report a specific message | [open](./conversations/post-conversations-by-conversationId-messages-by-messageId-reports/) |
| `POST` | `/conversations/{conversationId}/read` | Mark conversation as read for the actor | [open](./conversations/post-conversations-by-conversationId-read/) |
| `POST` | `/conversations/{conversationId}/reports` | Report a conversation | [open](./conversations/post-conversations-by-conversationId-reports/) |

## Resources

- [`chat-reports/`](./chat-reports/)
- [`conversations/`](./conversations/)

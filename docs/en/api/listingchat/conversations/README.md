# Resource: conversations

Domain: `listingchat`

| Method | Path | Contract |
|--------|------|----------|
| `GET` | `/conversations` | [List conversations for the authenticated actor](./get-conversations/) |
| `POST` | `/conversations` | [Open or resume a conversation for a published listing](./post-conversations/) |
| `GET` | `/conversations/{conversationId}` | [Get conversation detail (participant only)](./get-conversations-by-conversationId/) |
| `POST` | `/conversations/{conversationId}/block` | [Block the other participant across listing conversations](./post-conversations-by-conversationId-block/) |
| `GET` | `/conversations/{conversationId}/messages` | [Paginated message history (participant only)](./get-conversations-by-conversationId-messages/) |
| `POST` | `/conversations/{conversationId}/messages` | [Send a text message (participant only)](./post-conversations-by-conversationId-messages/) |
| `POST` | `/conversations/{conversationId}/messages/{messageId}/reports` | [Report a specific message](./post-conversations-by-conversationId-messages-by-messageId-reports/) |
| `POST` | `/conversations/{conversationId}/read` | [Mark conversation as read for the actor](./post-conversations-by-conversationId-read/) |
| `POST` | `/conversations/{conversationId}/reports` | [Report a conversation](./post-conversations-by-conversationId-reports/) |

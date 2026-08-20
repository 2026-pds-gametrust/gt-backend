#!/usr/bin/env bash
# Block the other participant across listing conversations
curl -X POST 'http://localhost:3000/conversations/{conversationId}/block' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'

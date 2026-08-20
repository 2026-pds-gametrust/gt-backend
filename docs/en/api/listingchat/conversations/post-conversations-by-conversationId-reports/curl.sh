#!/usr/bin/env bash
# Report a conversation
curl -X POST 'http://localhost:3000/conversations/{conversationId}/reports' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "reason": "string"
}'

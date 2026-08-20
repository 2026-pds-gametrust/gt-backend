#!/usr/bin/env bash
# Report a specific message
curl -X POST 'http://localhost:3000/conversations/{conversationId}/messages/{messageId}/reports' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "reason": "string"
}'

#!/usr/bin/env bash
# Send a text message (participant only)
curl -X POST 'http://localhost:3000/conversations/{conversationId}/messages' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "body": "string"
}'

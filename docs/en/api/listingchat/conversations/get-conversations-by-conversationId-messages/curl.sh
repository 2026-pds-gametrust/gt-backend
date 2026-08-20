#!/usr/bin/env bash
# Paginated message history (participant only)
curl -X GET 'http://localhost:3000/conversations/{conversationId}/messages?limit=50&before=string' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'

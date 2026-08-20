#!/usr/bin/env bash
# Get conversation detail (participant only)
curl -X GET 'http://localhost:3000/conversations/{conversationId}' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'

#!/usr/bin/env bash
# Mark conversation as read for the actor
curl -X POST 'http://localhost:3000/conversations/{conversationId}/read' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'

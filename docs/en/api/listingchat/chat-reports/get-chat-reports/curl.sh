#!/usr/bin/env bash
# List chat reports (backoffice/admin)
curl -X GET 'http://localhost:3000/chat-reports?limit=20&cursor=string' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'

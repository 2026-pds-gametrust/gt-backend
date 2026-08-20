#!/usr/bin/env bash
# List conversations for the authenticated actor
curl -X GET 'http://localhost:3000/conversations?limit=20&cursor=string' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'

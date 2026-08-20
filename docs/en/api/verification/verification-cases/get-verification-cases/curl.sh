#!/usr/bin/env bash
# List verification cases for moderation
curl -X GET 'http://localhost:3000/verification-cases?status=PENDING&q=string&moderatorId=string&minScore=0&maxScore=0&hasAiScore=false&limit=20&offset=0' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'

#!/usr/bin/env bash
# Return the authenticated public User
curl -X GET 'http://localhost:3000/auth/me' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'

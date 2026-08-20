#!/usr/bin/env bash
# Get authenticated user's own profile (owner projection)
curl -X GET 'http://localhost:3000/profiles/me' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'

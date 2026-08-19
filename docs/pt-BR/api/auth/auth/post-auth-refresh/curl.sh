#!/usr/bin/env bash
# Rotate a refresh token
curl -X POST 'http://localhost:3000/auth/refresh' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "refreshToken": "string"
}'

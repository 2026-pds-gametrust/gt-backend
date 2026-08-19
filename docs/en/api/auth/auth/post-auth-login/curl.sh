#!/usr/bin/env bash
# Log in with email and password
curl -X POST 'http://localhost:3000/auth/login' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "string",
  "password": "string"
}'

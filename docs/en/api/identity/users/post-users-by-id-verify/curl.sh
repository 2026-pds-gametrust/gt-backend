#!/usr/bin/env bash
# Verify a user identity
curl -X POST 'http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000/verify' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'

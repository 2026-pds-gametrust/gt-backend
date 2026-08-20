#!/usr/bin/env bash
# Assign user groups (ADMIN only)
curl -X PUT 'http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000/groups' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "groups": [
    "app-user"
  ]
}'

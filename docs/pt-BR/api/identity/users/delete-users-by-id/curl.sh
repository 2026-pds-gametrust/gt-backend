#!/usr/bin/env bash
# Delete a user
curl -X DELETE 'http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'

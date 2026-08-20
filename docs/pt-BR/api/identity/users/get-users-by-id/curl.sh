#!/usr/bin/env bash
# Get a user by ID
curl -X GET 'http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
